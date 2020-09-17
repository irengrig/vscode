/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { URI } from 'vs/base/common/uri';
import { IBookmarksManager, BookmarkType, SortType, bookmarkClass } from 'vs/workbench/contrib/scopeTree/common/bookmarks';
import { Emitter } from 'vs/base/common/event';

export class BookmarksManager implements IBookmarksManager {
	declare readonly _serviceBrand: undefined;

	static readonly WORKSPACE_BOOKMARKS_STORAGE_KEY: string = 'workbench.explorer.bookmarksWorkspace';
	static readonly GLOBAL_BOOKMARKS_STORAGE_KEY: string = 'workbench.explorer.bookmarksGlobal';

	globalBookmarks: Set<string> = new Set();
	workspaceBookmarks: Set<string> = new Set();

	sortType: SortType = SortType.NAME;

	private _onBookmarksChanged = new Emitter<{ uri: URI, bookmarkType: BookmarkType, prevBookmarkType: BookmarkType }>();
	public onBookmarksChanged = this._onBookmarksChanged.event;

	private _onDidSortBookmark = new Emitter<SortType>();
	public onDidSortBookmark = this._onDidSortBookmark.event;

	constructor(
		@IStorageService private readonly storageService: IStorageService
	) {
		this.initializeBookmarks();
	}

	// Preserve sorting by date when bookmarks are added to the sets (most recent is the last inserted)
	public setBookmark(resource: URI, scope: BookmarkType): void {
		const resourceAsString = resource.toString();
		let prevScope = BookmarkType.NONE;	// Undefined if bookmark already had the appropriate type

		// Bookmarks are deleted even they have to be added again in order to preserve ordering by 'date added', with most recent being the last inserted
		if (scope === BookmarkType.GLOBAL) {
			if (this.globalBookmarks.delete(resourceAsString)) {
				prevScope = BookmarkType.GLOBAL;
			} else if (this.workspaceBookmarks.delete(resourceAsString)) {
				this.saveWorkspaceBookmarks();
				prevScope = BookmarkType.WORKSPACE;
			}

			this.globalBookmarks.add(resourceAsString);
			this.saveGlobalBookmarks();
		} else if (scope === BookmarkType.WORKSPACE) {
			if (this.workspaceBookmarks.delete(resourceAsString)) {
				prevScope = BookmarkType.WORKSPACE;
			} else if (this.globalBookmarks.delete(resourceAsString)) {
				this.saveGlobalBookmarks();
				prevScope = BookmarkType.GLOBAL;
			}

			this.workspaceBookmarks.add(resourceAsString);
			this.saveWorkspaceBookmarks();
		} else {
			if (this.globalBookmarks.delete(resourceAsString)) {
				this.saveGlobalBookmarks();
				prevScope = BookmarkType.GLOBAL;
			} else if (this.workspaceBookmarks.delete(resourceAsString)) {
				this.saveWorkspaceBookmarks();
				prevScope = BookmarkType.WORKSPACE;
			}
		}

		this._onBookmarksChanged.fire({ uri: resource, bookmarkType: scope, prevBookmarkType: prevScope });
	}

	public getBookmarkType(resource: URI): BookmarkType {
		const resourceAsString = resource.toString();

		if (this.globalBookmarks.has(resourceAsString)) {
			return BookmarkType.GLOBAL;
		}

		if (this.workspaceBookmarks.has(resourceAsString)) {
			return BookmarkType.WORKSPACE;
		}

		return BookmarkType.NONE;
	}

	public toggleBookmarkType(resource: URI): BookmarkType {
		const newType = (this.getBookmarkType(resource) + 1) % 3;
		this.setBookmark(resource, newType);

		return newType;
	}

	public sortBookmarks(sortType: SortType) {
		this.sortType = sortType;
		this._onDidSortBookmark.fire(sortType);
	}

	private initializeBookmarks(): void {
		// Retrieve bookmarks from storageService
		this.initializeGlobalBookmarks();
		this.initializeWorkspaceBookmarks();
	}

	private initializeGlobalBookmarks(): void {
		const rawGlobalBookmarks = this.storageService.get(BookmarksManager.GLOBAL_BOOKMARKS_STORAGE_KEY, StorageScope.GLOBAL);
		if (rawGlobalBookmarks) {
			const gBookmarks = JSON.parse(rawGlobalBookmarks) as string[];
			this.globalBookmarks = new Set(gBookmarks);
		}
	}

	private initializeWorkspaceBookmarks(): void {
		const rawWorkspaceBookmarks = this.storageService.get(BookmarksManager.WORKSPACE_BOOKMARKS_STORAGE_KEY, StorageScope.WORKSPACE);
		if (rawWorkspaceBookmarks) {
			const wBookmarks = JSON.parse(rawWorkspaceBookmarks) as string[];
			this.workspaceBookmarks = new Set(wBookmarks);
		}
	}

	private saveWorkspaceBookmarks(): void {
		this.storageService.store(BookmarksManager.WORKSPACE_BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(this.workspaceBookmarks)), StorageScope.WORKSPACE);
	}

	private saveGlobalBookmarks(): void {
		this.storageService.store(BookmarksManager.GLOBAL_BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(this.globalBookmarks)), StorageScope.GLOBAL);
	}

	public changeTypeAndDisplay(bookmarkId: string, scope: BookmarkType): void {
		const element = document.getElementById(bookmarkId);
		if (!element) {
			return;
		}

		if (scope === BookmarkType.NONE) {
			element.style.visibility = 'hidden';
		} else {
			element.style.visibility = 'visible';
		}

		element.className = bookmarkClass(scope);
	}
}
