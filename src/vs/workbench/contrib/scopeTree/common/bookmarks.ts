/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';

export interface IBookmarksManager {
	readonly _serviceBrand: undefined;
	readonly globalBookmarks: Set<string>;
	readonly workspaceBookmarks: Set<string>;
	sortType: SortType;

	setBookmark(resource: URI, scope: BookmarkType): void;
	getBookmarkType(resource: URI): BookmarkType;
	toggleBookmarkType(resource: URI): BookmarkType;
	sortBookmarks(sortType: SortType): void;
	changeTypeAndDisplay(bookmarkId: string, scope: BookmarkType): void

	onBookmarksChanged: Event<{ uri: URI, bookmarkType: BookmarkType, prevBookmarkType: BookmarkType }>;
	onDidSortBookmark: Event<SortType>;
}

export const IBookmarksManager = createDecorator<IBookmarksManager>('bookmarksManager');

export const enum BookmarkType {
	NONE,
	WORKSPACE,
	GLOBAL
}

export const enum SortType {
	NAME,
	DATE
}

export function bookmarkClass(type: BookmarkType): string {
	if (type === BookmarkType.GLOBAL) {
		return 'bookmark-set-global';
	}

	if (type === BookmarkType.WORKSPACE) {
		return 'bookmark-set-workspace';
	}

	return 'bookmark-not-set';
}

export const allBookmarksClasses = [bookmarkClass(BookmarkType.NONE), bookmarkClass(BookmarkType.WORKSPACE), bookmarkClass(BookmarkType.GLOBAL)];
