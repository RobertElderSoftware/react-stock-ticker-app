var total_height = 300;

var LastChangeCell = React.createClass({
  render: function() {
    var cssclass = "text-right " + this.props.tickclass;
    return (
      <td className={cssclass}>
        <span className="span1">{this.props.last_change.toFixed(2)}</span>
      </td>
    );
  }
});

var CurrentPriceCell = React.createClass({
  render: function() {
    var cssclass = "mid-td text-center";
    return (
      <td className={cssclass}>
        <span>{this.props.price.toFixed(2)}</span>
      </td>
    );
  }
});

var Stock = React.createClass({
  render: function() {
    var tickclass = this.props.stock.last_change > 0 ? "up-tick" : (this.props.stock.last_change < 0 ? "down-tick" : "");
    var symbol = this.props.is_open ? "-" : "+" ;
    var symbol_node = (<a href="javascript:void(0);">{symbol}</a>);
    var cssclass = this.props.is_open ? "is-open" : "";
    cssclass = "clickable " + cssclass;
    return (
      <tr className={cssclass} onClick={this.props.onClick}>
        <td>{symbol_node}
        </td>
        <td>
          <span className="span1">{this.props.stock.symbol}</span>
        </td>
        <CurrentPriceCell tickclass={tickclass} price={this.props.stock.price} />
        <LastChangeCell tickclass={tickclass} last_change={this.props.stock.last_change} />
      </tr>
    );
  }
});

var CandleNode = React.createClass({
  render: function() {
    var data = this.props.data;
    var high = (data.open > data.close) ? data.open : data.close;
    var low = (data.open > data.close) ? data.close : data.open;
    var top_px = Math.floor(((data.max - high) / (data.max - data.min)) * total_height);
    var height_px = Math.floor(((high - low) / (data.max - data.min)) * total_height);
    var colour = data.open > data.close ? '#FF0000' : (data.open < data.close ? '#00FF00' : '#000000');
    var bar_width = 7;
    height_px = height_px == 0 ? 1 : height_px;
    var styles = {
      backgroundColor: colour,
      position: 'absolute',
      top: top_px + 'px',
      width: bar_width + 'px',
      height: height_px + 'px',
      left: ((this.props.data.index * bar_width) + (this.props.data.index -1)) + "px"
    };
    var onMouseOver = function () {
      this.props.onShowMouseOver(this.props.data.index);
    }.bind(this);

    var onMouseOut = function () {
      this.props.onShowMouseOver(undefined);
    }.bind(this);

    if(this.props.tooltipIndex == this.props.data.index){
      var popupStyles = {
        padding: '8px',
        zIndex: 1,
        backgroundColor: '#eeffdd',
        border: '1px solid #000000',
        position: 'absolute',
        top: '20px',
        width: '90px',
        height: '40px',
        left: "20px"
      };
      return (<div onMouseOut={onMouseOut} onMouseOver={onMouseOver} style={styles}>
        <div style={popupStyles}>
          <div>Open: {this.props.data.open.toFixed(2)}</div>
          <div>Close: {this.props.data.close.toFixed(2)}</div>
        </div>
      </div>);
    }else{
      return (<div onMouseLeave={onMouseOut} onMouseOver={onMouseOver} style={styles}></div>);
    }
  }
});


var StockScale = React.createClass({
  render: function() {
    var max = this.props.data.max;
    var min = this.props.data.min;
    var diff = max - min;
    var graph_increment = (diff / 0.1) > 4 ? 0.1 : (diff / 0.05) > 4 ? 0.05 : 0.01;
    nodes = [];

    var max_line_value = Math.floor(max / graph_increment) * graph_increment;
    var min_line_value = Math.floor(min / graph_increment) * graph_increment;
    for(var i = min_line_value; i < (max_line_value + graph_increment); i+=graph_increment){
      if(i > min && i < max){
        var top = Math.floor(((max - i) / (max - min)) * total_height);
        top = top > 280 ? 280 : top;
        nodes.push(<div className="scale-number" style={{ position: 'absolute', top: (top -10) + 'px'}}>{i.toFixed(2)}</div>);
      }
    }

    return (<td>{nodes}</td>);
  }
});

var StockChart = React.createClass({
  getInitialState: function() {
    return {tooltip_index: undefined};
  },
  onShowMouseOver(index){
    this.setState({tooltip_index: index});
  },
  render: function() {
    var min = 999999999;
    var max = 0;
    var candleNodes = [];
    var lineNodes = [];

    for(var i = 0; i < this.props.chartData.length; i++){
      if(this.props.chartData[i].price > max){
        max = this.props.chartData[i].price;
      }
      if(this.props.chartData[i].price < min){
        min = this.props.chartData[i].price;
      }
    }

    var diff = max - min;
    var graph_increment = (diff / 0.1) > 4 ? 0.1 : (diff / 0.05) > 4 ? 0.05 : 0.01;

    var max_line_value = Math.floor(max / graph_increment) * graph_increment;
    var min_line_value = Math.floor(min / graph_increment) * graph_increment;
    for(var i = min_line_value; i < (max_line_value + graph_increment); i+=graph_increment){
      if(i > min && i < max){
        var top = Math.floor(((max - i) / (max - min)) * total_height);
        lineNodes.push(<div key={i + "_line"} className="scale-line" style={{ width: '600px', height: '1px', backgroundColor: '#000000', position: 'absolute', top: top + 'px'}}></div>);
      }
    }

    for(var i = 0; i < this.props.chartData.length -1; i++){
      candleNodes.push(<CandleNode tooltipIndex={this.state.tooltip_index} onShowMouseOver={this.onShowMouseOver} data={
        {
          min: min,
          max: max,
          open: this.props.chartData[i].price,
          close: this.props.chartData[i + 1].price,
          index: i
        }
      } key={i} />);
    }



    return (
      <tr className="stockchart">
        <td>
        </td>
        <StockScale data={ {max: max, min: min} } />
        <td className="mid-td">{lineNodes}{candleNodes}
        </td>
        <td>
        </td>
      </tr>
    );
  }
});

var StockBox = React.createClass({
  loadStocksFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        var newHistory = this.state.history;
        /*  Add to stored history */
        for(var i = 0; i < data.length; i++){
          if(data[i]["symbol"] in newHistory){
            newHistory[data[i]["symbol"]].push(data[i]);
            if(newHistory[data[i]["symbol"]].length > 75){
              newHistory[data[i]["symbol"]].shift();
            }
          }else{
            newHistory[data[i]["symbol"]] = [data[i]];
          }
        }
        this.setState({data: data, history: newHistory});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: [], history: {}};
  },
  componentDidMount: function() {
    this.loadStocksFromServer();
    setInterval(this.loadStocksFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="stock-box">
        <StockList history={this.state.history} data={this.state.data} />
      </div>
    );
  }
});

var StockList = React.createClass({
  getInitialState: function() {
    return {"selected_stock": 2};
  },
  onStockClick: function (key){
    if(key == this.state.selected_stock){
      this.setState({"selected_stock": undefined});
    }else{
      this.setState({"selected_stock": key});
    }
  },
  render: function() {
   var self = this;
   var stockNodes = [<tr key={0 + "header"}><th className="text-middle">*</th><th>Symbol</th><th>Price / Chart</th><th>Change</th></tr>];
   for(var i = 0; i < this.props.data.length; i++){
      var callback = (function (key) { return function () { this.onStockClick(key); }.bind(this) }.bind(this))(i);
      var is_open = this.state.selected_stock == i;
      stockNodes.push(<Stock is_open={is_open} stock={this.props.data[i]} key={i} onClick={callback} />);
      if(is_open){
        stockNodes.push(<tr key={i + "_placeholder"}><td>...</td><td></td><td className="text-center">Chart of {this.props.data[i]["symbol"]}</td><td></td></tr>);
        stockNodes.push(<StockChart key={i + "_chart"} chartData={this.props.history[this.props.data[i]["symbol"]]} />);
      }else{
        stockNodes.push(<tr key={i + "_placeholder"}><td></td><td></td><td></td><td></td></tr>);
        stockNodes.push(<tr key={i + "_chartplaceholder"}><td></td><td></td><td></td><td></td></tr>);
      }
    };
    return (<table className="stock-table table-striped"><tbody>{stockNodes}</tbody></table>);
  }
});

React.render(
  <StockBox url="server.php" pollInterval={300} />,
  document.getElementById('content')
);
