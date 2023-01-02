import * as React from 'react';
import $ from 'jquery';
import { observer } from 'mobx-react';
import { Icon, IconObject } from 'Component';
import { I, ObjectUtil, Preview, keyboard } from 'Lib';
import { detailStore, popupStore } from 'Store';

interface Props extends I.HeaderComponent {};

const HeaderMainGraph = observer(class HeaderMainGraph extends React.Component<Props, object> {

	timeout: number = 0;

	constructor (props: any) {
		super(props);
		
		this.onOpen = this.onOpen.bind(this);
		this.onPathOver = this.onPathOver.bind(this);
		this.onPathOut = this.onPathOut.bind(this);
	};

	render () {
		const { rootId, onHome, onForward, onBack, onNavigation, onSearch } = this.props;
		const object = detailStore.get(rootId, rootId, []);

		return (
			<React.Fragment>
				<div className="side left">
					<Icon className="expand big" tooltip="Open as object" onClick={this.onOpen} />
					<Icon className="home big" tooltip="Home" onClick={onHome} />
					<Icon className={[ 'back', 'big', (!keyboard.checkBack() ? 'disabled' : '') ].join(' ')} tooltip="Back" onClick={onBack} />
					<Icon className={[ 'forward', 'big', (!keyboard.checkForward() ? 'disabled' : '') ].join(' ')} tooltip="Forward" onClick={onForward} />
					<Icon className="nav big" tooltip="Navigation" onClick={onNavigation} />
				</div>

				<div className="side center" />
				<div className="side right" />
			</React.Fragment>
		);
	};

	onOpen () {
		const { rootId } = this.props;

		popupStore.closeAll(null, () => {
			ObjectUtil.openRoute({ id: rootId, layout: I.ObjectLayout.Graph });
		});
	};

	onPathOver (e: any) {
		Preview.tooltipShow('Click to search', $(e.currentTarget), I.MenuDirection.Center, I.MenuDirection.Bottom);
	};

	onPathOut () {
		Preview.tooltipHide(false);
	};

});

export default HeaderMainGraph;