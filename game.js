function reset(){	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(let i = 0; i < circles.length; i++){
		playerCirclesIndexes = [];
		circles[i].innerHTML = '';
		circles[i].style.background = 'red';
		circles[i].addEventListener("click", onCircleClick);
	}
}

function buildPath(indexes, color){
	for(let i = 0; i < circles.length; i++){
		circles[i].style.background = 'red';
		circles[i].innerHTML = '';
	}
	for(let i = 0; i < indexes.length; i++){
		circles[indexes[i]].style.background = color;
		circles[indexes[i]].innerHTML = i + 1;
	}
	for(let i = 0; i < indexes.length-1; i++)
		drawLine(indexes[i], indexes[i+1]);	
}

function drawLine(index1, index2){
	ctx.beginPath();
	ctx.moveTo(parseInt(circles[index1].style.left) + radius / 2, parseInt(circles[index1].style.top) + radius / 2);
	ctx.lineTo(parseInt(circles[index2].style.left) + radius / 2, parseInt(circles[index2].style.top) + radius / 2);
	ctx.stroke();
}

function showSolution(){
	let btn = document.getElementById('showSolution');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if(btn.innerHTML == 'Show the best solution'){		
		buildPath(bestIndexes, 'green');
		btn.innerHTML = 'Show my solution';
	}
	else{
		buildPath(playerCirclesIndexes, 'blue');
		btn.innerHTML = 'Show the best solution';
	}
}

function startLevel(){	
	document.getElementById('nextLevel').disabled = true;
	document.getElementById('showSolution').disabled = true;
	document.getElementById('showSolution').innerHTML = 'Show the best solution';
	document.getElementById('percent').innerHTML = 'Accuracy: ';
	++level;	
	generateLevelParams();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(let i = 0; i < circles.length; i++)
		document.body.removeChild(circles[i]);	
	circles = []; playerCirclesIndexes = []; bestIndexes = []; 
	freeCoordinates = []; pointsCoordinates = []; numbers = [];	
	distances.clear();
	theBest = isFindingTheShortest ? 999999 : 0; 
	for(let i = 0; i < width; i++)
		for(let j = 0; j < height; j++)
			freeCoordinates.push([i * radius, j * radius]);		
	generateCirclePositions();

	for(let i = 0; i < numberOfCirlcles; i++)
		numbers.push(i.toString());

	combinations(numbers, 2, 0, ['','']);
	for(let i = 0; i < maxGreen; i++)
		bestIndexes.push(0);
	heapPermutation(numbers, numbers.length, maxGreen);
	displayCircles();
	
	let task = 'Connect ' + maxGreen + ' points in the ';
	task += isFindingTheShortest ? 'SHORTEST ' : 'LONGEST ';
	task += 'path\nReach at least ';
	task += accuracy + '% accuracy to pass this level';
	document.getElementById('task').innerHTML = task;
	document.getElementById('resetBtn').disabled = false;
	
	timerTick();
}

function newGame(){
	level = -1;
	document.getElementById('score').innerHTML = 'Your score: 0';
	startLevel();
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));	
}

function onCircleClick(e){	
	e.target.removeEventListener("click", onCircleClick);
	playerCirclesIndexes.push(Array.from(circles).indexOf(e.target));	
	e.target.style.background = 'blue';
	let length = playerCirclesIndexes.length;
	e.target.innerHTML = length;
	if(length > 1){		
		drawLine(playerCirclesIndexes[length-2], playerCirclesIndexes[length-1]);
		if(length == maxGreen){
			document.getElementById('resetBtn').disabled = true;
			document.getElementById('showSolution').disabled = false; 
			let distance = 0;
			for(let i = 1; i < length;  i++)
				distance += distances.get(playerCirclesIndexes[i-1] + ' ' + playerCirclesIndexes[i]);
			let playerAccuracy = isFindingTheShortest ? Math.round(theBest / distance * 100.0) :
			Math.round(distance / theBest * 100.0);
			document.getElementById('percent').innerHTML += playerAccuracy  + '%';
			if(playerAccuracy  >= accuracy){
				clearTimeout(setTimeoutFunc);
				document.getElementById('score').innerHTML = 'Your score: ' + (level + 1);
				document.getElementById('nextLevel').disabled = false;				
			}
			else
				finishGame('You lost');
			for(let i = 0; i < circles.length; i++)
				circles[i].removeEventListener("click", onCircleClick);
			return;
		}
	}	
}

function finishGame(message){
	clearTimeout(setTimeoutFunc);
	if(level > highScore){
		document.getElementById('highScore').innerHTML = 'Highscore: ' + level;
		localStorage.setItem("highScore", level);
	}
	setTimeout(() => {alert(message);}, 50);
}

function combinations(arr, len, startPosition, result){
	if (len == 0){		
		let keys = [result[0] + ' ' + result[1], result[1] + ' ' + result[0]];
		let distance = Math.round(Math.sqrt(Math.pow(pointsCoordinates[parseInt(result[0])][0] - 
		pointsCoordinates[parseInt(result[1])][0], 2) + Math.pow(pointsCoordinates[parseInt(result[0])][1] -
		pointsCoordinates[parseInt(result[1])][1], 2)));
		distances.set(keys[0], distance);	distances.set(keys[1], distance);	
        return;
    }       
    for (let i = startPosition; i <= arr.length-len; i++){
        result[result.length - len] = arr[i];
        combinations(arr, len-1, i+1, result);
    }
}

function heapPermutation(arr, size, number){
	if(size == 1){
		let totalDistance = 0;
		for(let i = 0; i < maxGreen - 1; i++){	
			let key = arr[i] + ' ' + arr[i+1], distance = distances.get(key);
			if(isFindingTheShortest){
				if(distance + totalDistance >= theBest)
					return;	
			}
			else{
				if(distance + totalDistance + longestPossible * (maxGreen - 2 - i) <= theBest)
					return;	
			}				
			totalDistance += distance;
		}			
		if(isFindingTheShortest){
			if(totalDistance < theBest){
				theBest = totalDistance;
				for(let i = 0; i < maxGreen; i++)
					bestIndexes[i] = parseInt(arr[i]);
			}
		}
		else{
			if(totalDistance > theBest){
				theBest = totalDistance;
				for(let i = 0; i < maxGreen; i++)
					bestIndexes[i] = parseInt(arr[i]);
			}
		}
		return;
	}
	 for (let i=0; i<size; i++) 
	{ 
        heapPermutation(arr,size-1,number); 
        if (size%2==1) 
            arr[0] = [arr[size-1], arr[size-1] = arr[0]][0]; 
        else
            arr[i] = [arr[size-1], arr[size-1] = arr[i]][0]; 
    } 
}

function generateCirclePositions(){
	for(let i = 0; i < numberOfCirlcles; i++){	
		let rand = getRandomInt(freeCoordinates.length);
		pointsCoordinates.push([freeCoordinates[rand][0], freeCoordinates[rand][1]]);			
		if(i != numberOfCirlcles - 1){		
			if(pointsCoordinates[i][0] != (width - 1) * radius){
				if(pointsCoordinates[i][1] != (height - 1) * radius)
					freeCoordinates.splice(rand + height + 1, 1);			
				freeCoordinates.splice(rand + height, 1);
				if(pointsCoordinates[i][1] != 0)
					freeCoordinates.splice(rand + height - 1, 1);			
			}
			if(pointsCoordinates[i][1] != (height - 1) * radius)
				freeCoordinates.splice(rand + 1, 1);
			freeCoordinates.splice(rand, 1);
			if(pointsCoordinates[i][1] != 0)
				freeCoordinates.splice(rand - 1, 1);
			if(pointsCoordinates[i][0] != 0){
				if(pointsCoordinates[i][1] != (height - 1) * radius)
					freeCoordinates.splice(rand - height + 1, 1);
				freeCoordinates.splice(rand - height, 1);
				if(pointsCoordinates[i][1] != 0)
					freeCoordinates.splice(rand - height - 1, 1);
			}
		}			
	}
}

function generateLevelParams(){
	let minMaxGreen = parseInt(level / 10) + 3 < maxCircles ? parseInt(level / 10) + 3 : maxCircles;
	let randMaxGreen = getRandomInt(maxCircles - minMaxGreen) + minMaxGreen;
	maxGreen = randMaxGreen;
	numberOfCirlcles = randMaxGreen + getRandomInt(maxCircles - randMaxGreen);
	isFindingTheShortest = getRandomInt(2);
	let hardness = maxGreen * greenCoef + numberOfCirlcles;
	hardness += isFindingTheShortest ? 0 : Math.round(hardness / maxHardness * maxLongestHardness);	
	let minAccuracy = 50 + maxHardness - hardness + level < 100 ? 50 + maxHardness - hardness + level : 100;
	accuracy = getRandomInt(10) + parseInt(minAccuracy);
	hardness = Math.round(hardness * accuracy / 100);
	seconds = 30 + Math.round(hardness / 5.0) - level > 8 ? 30 + Math.round(hardness / 5.0) - level : 8;
}

function displayCircles(){
	for(let i = 0; i < numberOfCirlcles; i++){
		let circle = document.createElement('div');
		circles.push(circle);
		circle.className = 'circle';
		circle.style.left = pointsCoordinates[i][0] + 'px';
		circle.style.top = pointsCoordinates[i][1] + 'px';
		circle.addEventListener("click", onCircleClick);
		document.body.appendChild(circles[i]);
	}
}

function timerTick(){
	document.getElementById('time').innerHTML = 'Seconds left: ' + seconds;
	--seconds;
	setTimeoutFunc = setTimeout(timerTick, 1000);
	if(seconds == -1)
		finishGame('You lost on time');
}

let setTimeoutFunc;
let level = -1;
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0;
document.getElementById('highScore').innerHTML = 'Highscore: ' + highScore;	

let circles = [], playerCirclesIndexes = [], bestIndexes = [];
let maxGreen, numberOfCirlcles,  isFindingTheShortest, accuracy, seconds;
let freeCoordinates = [], pointsCoordinates = [];
let numbers = [];
let theBest = 999999; 
let distances = new Map();
const radius = 20, maxCircles = 8, greenCoef = 3;
let maxHardness = maxCircles * greenCoef + maxCircles;
const maxLongestHardness = Math.round(maxHardness / 7);
maxHardness += maxLongestHardness;

let width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

let height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

let canvas = document.getElementById('myCanvas');
canvas.width = width / 4 * 3 - radius;
canvas.height = height - radius;
const longestPossible = Math.round(Math.sqrt(Math.pow(width / 4 * 3, 2) + Math.pow(height, 2)));
width = parseInt(canvas.width / radius); 
height = parseInt(canvas.height / radius);
let ctx = canvas.getContext("2d");
startLevel();