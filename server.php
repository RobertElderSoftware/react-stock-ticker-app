<?php
$stocks = file_get_contents('_stocks.json');

$stocksDecoded = json_decode($stocks, true);
foreach($stocksDecoded as $key => $value){
	$diff = 0;
	$num_cents = rand(1, 8);
	if($stocksDecoded[$key]['is_trending']){
		$n = rand(1, 4);
		if($n === 1 || $n === 2){
			$diff = (0.01 * $stocksDecoded[$key]['trend_direction']);
		}else if($n === 3){
			$diff = (0.01 * -$stocksDecoded[$key]['trend_direction']);
		}
	}else{
		$n = rand(1, 3);
		$diff = ($n -2) * 0.01;
	}
	/*  Randomly increase by a multiple */
	if(rand(1, 3) === 1){
		$diff = $diff * $num_cents;
	}
	$stocksDecoded[$key]['price'] += $diff;
	$stocksDecoded[$key]['last_change'] = $diff;

	if(rand(1, 25) === 1){
		$stocksDecoded[$key]['is_trending'] = false;
		/*  Trend direction will be up or down  */
		if(rand(1, 2) === 1){
			$stocksDecoded[$key]['trend_direction'] = 1;
		}else{
			$stocksDecoded[$key]['trend_direction'] = -1;
		}
	}
	if(rand(1, 5) === 1){
		$stocksDecoded[$key]['is_trending'] = true;
	}
}

$stocks = json_encode($stocksDecoded, JSON_PRETTY_PRINT);
file_put_contents('_stocks.json', $stocks);

header('Content-Type: application/json');
echo $stocks;
?>
