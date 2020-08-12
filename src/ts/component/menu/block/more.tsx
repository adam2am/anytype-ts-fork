import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon, MenuItemVertical } from 'ts/component';
import { I, C, keyboard, Key, Util, DataUtil, focus, crumbs } from 'ts/lib';
import { blockStore, commonStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends I.Menu {
	history?: any;
};

const $ = require('jquery');
const { ipcRenderer } = window.require('electron');

@observer
class MenuBlockMore extends React.Component<Props, {}> {
	
	n: number = -1;
	
	constructor (props: any) {
		super(props);
		
		this.onClick = this.onClick.bind(this);
	};

	render () {
		const items = this.getItems();

		return (
			<div>
				{items.map((action: any, i: number) => (
					<MenuItemVertical key={i} {...action} onClick={(e: any) => { this.onClick(e, action); }} onMouseEnter={(e: any) => { this.onOver(e, action); }} />
				))}
			</div>
		);
	};
	
	componentDidMount () {
		this.unbind();
		this.setActive();
		
		const win = $(window);
		win.on('keydown.menu', (e: any) => { this.onKeyDown(e); });
	};
	
	componentWillUnmount () {
		this.unbind();
	};
	
	unbind () {
		$(window).unbind('keydown.menu');
	};
	
	setActive = (item?: any, scroll?: boolean) => {
		const items = this.getItems();
		if (item) {
			this.n = items.findIndex((it: any) => { return it.id == item.id });
		};
		this.props.setActiveItem(items[this.n], scroll);
	};
	
	onKeyDown (e: any) {
		e.preventDefault();
		e.stopPropagation();
		
		keyboard.disableMouse(true);
		
		const k = e.key.toLowerCase();
		const items = this.getItems();
		const l = items.length;
		const item = items[this.n];
		
		switch (k) {
			case Key.up:
				this.n--;
				if (this.n < 0) {
					this.n = l - 1;
				};
				this.setActive(null, true);
				break;
				
			case Key.down:
				this.n++;
				if (this.n > l - 1) {
					this.n = 0;
				};
				this.setActive(null, true);
				break;
				
			case Key.enter:
			case Key.space:
				if (item) {
					this.onClick(e, item);
				};
				break;
			
			case Key.escape:
				this.props.close();
				break;
		};
	};
	
	getItems () {
		const { param } = this.props;
		const { data } = param;
		const { blockId, rootId } = data;
		const block = blockStore.getLeaf(rootId, blockId);

		if (!block) {
			return [];
		};
		
		const { content } = block;
		const details = blockStore.getDetails(rootId, content.targetBlockId);

		let items = [];
		if (block.isPageSet()) {
			items = [
				{ id: 'undo', icon: 'undo', name: 'Undo' },
				{ id: 'redo', icon: 'redo', name: 'Redo' },
				{ id: 'print', icon: 'print', name: 'Print' },
			];
		} else
		if (block.isPage()) {
			items = [
				{ id: 'undo', icon: 'undo', name: 'Undo' },
				{ id: 'redo', icon: 'redo', name: 'Redo' },
				{ id: 'print', icon: 'print', name: 'Print' },
				{ id: 'history', icon: 'history', name: 'History' },
				//{ id: 'move', icon: 'move', name: 'Move to' },
				//{ id: 'export', icon: 'export', name: 'Export to web' },
			];
			
			if (details.isArchived) {
				items.push({ id: 'removePage', icon: 'remove', name: 'Delete' });
			} else {
				items.push({ id: 'archivePage', icon: 'remove', name: 'Archive' });
			};
		} else 
		if (block.isLinkPage()) {
			items = [
				{ id: 'move', icon: 'move', name: 'Move to' },
				{ id: 'archiveIndex', icon: 'remove', name: 'Archive' }
			];
		} else {
			items = [
				{ id: 'move', icon: 'move', name: 'Move to' },
				//{ id: 'copy', icon: 'copy', name: 'Duplicate' },
				{ id: 'remove', icon: 'remove', name: 'Delete' },
			];
		};
		
		return items;
	};
	
	onOver (e: any, item: any) {
		if (!keyboard.isMouseDisabled) {
			this.setActive(item, false);
		};
	};
	
	onClick (e: any, item: any) {
		const { param, history } = this.props;
		const { data } = param;
		const { blockId, rootId, onSelect } = data;
		const { breadcrumbs } = blockStore;
		const block = blockStore.getLeaf(rootId, blockId);
		
		if (!block) {
			return;
		};
		
		const children = blockStore.getChildren(breadcrumbs, breadcrumbs);
		const prev = children[children.length - 2];
		
		let close = true;
		
		if (onSelect) {
			onSelect(item);
		};
		
		focus.clear(false);
		
		switch (item.id) {
			case 'undo':
				C.BlockUndo(rootId);
				close = false;
				break;
				
			case 'redo':
				C.BlockRedo(rootId);
				close = false;
				break;
				
			case 'print':
				window.setTimeout(() => { window.print(); }, 300);
				break;
				
			case 'export':
				C.BlockGetPublicWebURL(rootId, (message: any) => {
					if (message.url) {
						ipcRenderer.send('urlOpen', message.url);
					};
				});
				break;

			case 'history':
				history.push('/main/history/' + blockId);
				break;
			
			case 'move':
				commonStore.popupOpen('navigation', { 
					preventResize: true,
					data: { 
						type: I.NavigationType.Move, 
						expanded: true,
						...data,
					},
				});
				break;
				
			case 'copy':
				break;
				
			case 'archivePage':
				C.BlockListSetPageIsArchived(rootId, [ blockId ], true, (message: any) => {
					crumbs.cut(I.CrumbsType.Page, (children.length > 0 ? children.length - 1 : 0));
					
					if (prev) {
						DataUtil.pageOpen(e, prev.content.targetBlockId);
					} else {
						history.push('/main/index');
					};
				});
				break;

			case 'archiveIndex':
				C.BlockListSetPageIsArchived(rootId, [ block.content.targetBlockId ], true);
				break;

			case 'move':
				commonStore.popupOpen('navigation', { 
					preventResize: true,
					data: { 
						type: I.NavigationType.Move, 
						expanded: true,
						...data,
					}, 
				});
				break;
				
			case 'remove':
				C.BlockUnlink(rootId, [ blockId ], (message: any) => {
					if (block.isPage()) {
						history.push('/main/index');
					};
				});
				break;

			case 'removePage':
				C.BlockListDeletePage([ blockId ], (message: any) => {
					if (block.isPage()) {
						history.push('/main/index');
					};
				});
				break;
		};
		
		if (close) {
			this.props.close();
		};
	};

};

export default MenuBlockMore;