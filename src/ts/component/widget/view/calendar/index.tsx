import * as React from 'react';
import { observer } from 'mobx-react';
import { Select, Icon } from 'Component';
import { I, UtilDate, translate } from 'Lib';

interface State {
	value: number;
};

const WidgetViewCalendar = observer(class WidgetViewCalendar extends React.Component<I.WidgetListComponent, State> {

	node = null;
	refMonth = null;
	refYear = null;
	state = {
		value: UtilDate.now(),
	};

	constructor (props: I.WidgetListComponent) {
		super(props);

		this.onArrow = this.onArrow.bind(this);
	};

	render (): React.ReactNode {
		const { value } = this.state;
		const data = this.getData();
		const { m, y } = this.getDateParam(value);
		const today = this.getDateParam(UtilDate.now());
		const days = UtilDate.getWeekDays();
		const months = UtilDate.getMonths();
		const years = UtilDate.getYears(0, 3000);

		return (
			<div ref={ref => this.node = ref} className="body">
				<div id="dateSelect" className="dateSelect">
					<div className="side left">
						<Select 
							ref={ref => this.refMonth = ref}
							id="calendar-month" 
							value={m} 
							options={months} 
							className="month" 
							onChange={m => this.setValue(UtilDate.timestamp(y, m, 1))} 
						/>
						<Select 
							ref={ref => this.refYear = ref}
							id="calendar-year" 
							value={y} 
							options={years} 
							className="year" 
							onChange={y => this.setValue(UtilDate.timestamp(y, m, 1))} 
						/>
					</div>

					<div className="side right">
						<Icon className="arrow left" onClick={() => this.onArrow(-1)} />
						<Icon className="arrow right" onClick={() => this.onArrow(1)} />
					</div>
				</div>

				<div className="table">
					<div className="tableHead">
						{days.map((item, i) => (
							<div key={i} className="item th">
								{item.name.substring(0, 2)}
							</div>
						))}
					</div>

					<div className="tableBody">
						{data.map((item, i) => {
							const cn = [];
							if (m != item.m) {
								cn.push('other');
							};
							if ((today.d == item.d) && (today.m == item.m) && (today.y == item.y)) {
								cn.push('active');
							};
							if (i < 7) {
								cn.push('first');
							};
							return <div key={i} className="day">{item.d}</div>;
						})}
					</div>
				</div>
			</div>
		);
	};

	getDateParam (t: number) {
		const [ d, m, y ] = UtilDate.date('j,n,Y', t).split(',').map(it => Number(it));
		return { d, m, y };
	};

	getData () {
		return UtilDate.getCalendarMonth(this.state.value);
	};

	onArrow (dir: number) {
		let { m, y } = this.getDateParam(this.state.value);

		m += dir;
		if (m < 0) {
			m = 12;
			y--;
		};
		if (m > 12) {
			m = 1;
			y++;
		};

		this.setValue(UtilDate.timestamp(y, m, 1));
	};

	setValue (value: number) {
		this.setState({ value });
	};

});

export default WidgetViewCalendar;