/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from 'vs/base/common/uri';
import * as DOM from 'vs/base/browser/dom';
import { dirname, basename } from 'vs/base/common/resources';
import { IResourceLabel, ResourceLabels } from 'vs/workbench/browser/labels';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { IExplorerService } from 'vs/workbench/contrib/files/common/files';
import { ITreeRenderer, ITreeNode, ITreeElement } from 'vs/base/browser/ui/tree/tree';
import { FuzzyScore } from 'vs/base/common/filters';
import { SortType } from 'vs/workbench/contrib/scopeTree/common/bookmarks';

export function getDirectoriesAsSortedTreeElements(rawDirs: Set<string>, sortType: SortType): ITreeElement<Directory>[] {
	const unsortedTreeElements: ITreeElement<Directory>[] = [];
	rawDirs.forEach(dir => {
		unsortedTreeElements.push({
			element: new Directory(dir)
		});
	});
	return sortType === SortType.NAME ? sortDirectoriesByName(unsortedTreeElements) : sortBookmarksByDate(unsortedTreeElements);
}

function sortDirectoriesByName(dirs: ITreeElement<Directory>[]): ITreeElement<Directory>[] {
	return dirs.sort((dir1, dir2) => {
		const compareNames = dir1.element.getName().localeCompare(dir2.element.getName());

		// If directories have the same name, compare them by their full path
		return compareNames || dir1.element.getParent().localeCompare(dir2.element.getParent());
	});
}

function sortBookmarksByDate(bookmarks: ITreeElement<Directory>[]): ITreeElement<Directory>[] {
	// Order has to be reversed when bookmarks are sorted by date because bookmarksManager keeps the most recent at the end of the array
	return bookmarks.reverse();
}

export function findIndexInSortedArray(resource: string, directories: ITreeElement<Directory>[]) {
	// Assuming that this array is sorted by name, find the index for this resource using a binary search
	let left = 0;
	let right = directories.length;

	while (left < right) {
		const mid = (left + right) >>> 1;
		if (directories[mid].element.getName() < resource) {
			left = mid + 1;
		} else {
			right = mid;
		}
	}

	return left;
}

export class Directory {
	private _resource: URI;
	private _name: string;
	private _parentName: string;
	exists: boolean = true;

	constructor(path: string) {
		this._resource = URI.parse(path);
		this._name = basename(this._resource);
		this._parentName = dirname(this._resource).toString();
	}

	public getName(): string {
		return this._name;
	}

	public getParent(): string {
		return this._parentName;
	}

	get resource(): URI {
		return this._resource;
	}
}

export interface IDirectoryTemplateData {
	dirContainer: HTMLElement;
	label: IResourceLabel;
	elementDisposable: IDisposable;
}

export class DirectoryElementIconRenderer implements IDisposable {
	protected _focusIcon!: HTMLElement;

	constructor(protected readonly container: HTMLElement,
		protected readonly stat: URI,
		@IExplorerService protected readonly explorerService: IExplorerService) {
		this.renderFocusIcon();
		this.addListeners();
	}

	get focusIcon(): HTMLElement {
		return this._focusIcon;
	}

	private showIcon = () => {
		this._focusIcon.style.visibility = 'visible';
	};

	private hideIcon = () => {
		this._focusIcon.style.visibility = 'hidden';
	};

	private setRoot = () => {
		this.explorerService.setRoot(this.stat);
	};

	private addListeners(): void {
		this.container.addEventListener('mouseover', this.showIcon);
		this.container.addEventListener('mouseout', this.hideIcon);
		this._focusIcon.addEventListener('click', this.setRoot);
	}

	private renderFocusIcon(): void {
		this._focusIcon = document.createElement('img');
		this._focusIcon.className = 'scope-tree-focus-icon-near-bookmark';
		this.container.insertBefore(this._focusIcon, this.container.firstChild);
	}

	dispose(): void {
		this._focusIcon.remove();
		// Listeners need to be removed because container (templateData.label.element) is not removed from the DOM.
		this.container.removeEventListener('mouseover', this.showIcon);
		this.container.removeEventListener('mouseout', this.hideIcon);
		this._focusIcon.removeEventListener('click', this.setRoot);
	}
}

export abstract class DirectoryRenderer implements ITreeRenderer<Directory, FuzzyScore, IDirectoryTemplateData> {
	constructor(
		protected labels: ResourceLabels,
		protected readonly explorerService: IExplorerService
	) { }

	abstract get templateId(): string;

	renderTemplate(container: HTMLElement): IDirectoryTemplateData {
		const label = this.labels.create(container, { supportHighlights: true });
		const dirContainer = DOM.append(container, document.createElement('div'));
		return { dirContainer: dirContainer, label: label, elementDisposable: Disposable.None };
	}

	abstract renderElement(element: ITreeNode<Directory, FuzzyScore>, index: number, templateData: IDirectoryTemplateData, height: number | undefined): void;

	disposeTemplate(templateData: IDirectoryTemplateData): void {
		templateData.elementDisposable.dispose();
		templateData.label.dispose();
	}

	disposeElement(element: ITreeNode<Directory, FuzzyScore>, index: number, templateData: IDirectoryTemplateData, height: number | undefined): void {
		templateData.elementDisposable.dispose();
	}
}
