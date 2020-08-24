/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/scopeTreeFileIcon';
import { IBreadcrumbObserver } from 'vs/workbench/browser/parts/editor/breadcrumbObserver';
import { IFileStat, FileKind } from 'vs/platform/files/common/files';
import { IResourceLabel } from 'vs/workbench/browser/labels';
import { URI } from 'vs/base/common/uri';
import { Tree } from 'vs/workbench/browser/parts/editor/breadcrumbsPicker';
import { IScopeTreeService } from 'vs/workbench/contrib/scopeTree/common/scopeTree';

export class BreadcrumbObserver implements IBreadcrumbObserver {
	declare readonly _serviceBrand: undefined;
	private readonly locationID: string = 'breadcrumbFocusIconContainer';

	constructor(
		@IScopeTreeService private readonly scopeTreeService: IScopeTreeService
	) { }

	registerTreeListeners(tree: Tree<any, any>): void {
		tree.onMouseOver(e => {
			const element = e.element as IFileStat;
			if (element) {
				this.scopeTreeService.showFocusIcon(element.resource, this.locationID);
			}
		});

		tree.onMouseOut(e => {
			const element = e.element as IFileStat;
			if (element) {
				this.scopeTreeService.hideFocusIcon(element.resource, this.locationID);
			}
		});
	}

	renderFocusIcon(resource: URI, fileKind: FileKind, templateData: IResourceLabel): void {
		templateData.element.style.float = '';

		const iconContainer = this.scopeTreeService.renderFocusIcon(resource, this.locationID);
		const previousIcon = templateData.element.lastChild as HTMLElement;
		if (previousIcon && previousIcon.className === 'scope-tree-focus-icon') {
			templateData.element.removeChild(previousIcon);
		}

		if (fileKind !== FileKind.FILE) {
			templateData.element.style.float = 'left';
			templateData.element.appendChild(iconContainer);
		}
	}
}
