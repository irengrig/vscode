/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface IScopeTreeService {
	readonly _serviceBrand: undefined;
	readonly iconName: string;
	renderFocusIcon(resource: URI, locationID: string): HTMLElement;
	showFocusIcon(resource: URI, locationID: string): void;
	hideFocusIcon(resource: URI, locationID: string): void;
}

export const IScopeTreeService = createDecorator<IScopeTreeService>('scopeTreeService');
