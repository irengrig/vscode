/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScopeTreeService } from 'vs/workbench/contrib/scopeTree/common/scopeTree';
import { URI } from 'vs/base/common/uri';
import { IExplorerService } from 'vs/workbench/contrib/files/common/files';

export class ScopeTreeService implements IScopeTreeService {
	declare readonly _serviceBrand: undefined;
	readonly iconName: string = 'scope-tree-focus-icon';

	constructor(
		@IExplorerService private readonly explorerService: IExplorerService
	) { }

	renderFocusIcon(resource: URI, locationID: string): HTMLElement {
		const iconContainer = document.createElement('img');
		iconContainer.className = 'scope-tree-focus-icon';
		iconContainer.id = locationID + '_' + resource.toString();
		iconContainer.onclick = () => {
			this.explorerService.setRoot(resource);
		};

		return iconContainer;
	}

	showFocusIcon(resource: URI, locationID: string): void {
		const icon = document.getElementById(locationID + '_' + resource.toString());
		if (icon) {
			icon.style.visibility = 'visible';
		}
	}

	hideFocusIcon(resource: URI, locationID: string): void {
		const icon = document.getElementById(locationID + '_' + resource.toString());
		if (icon) {
			icon.style.visibility = 'hidden';
		}
	}
}
