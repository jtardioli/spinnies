const CANVAS_SIZE = 500;

const MIN_COLOR = 0;
const MAX_COLOR = 360;

const MIN_Y = 0;
const MAX_Y = CANVAS_SIZE;
const MAX_FIXED_Y = 50;

const txHash =
  "0x767f618af3dc0d14c0f937a13d545360014a0bb650cab01e237060aac63ab22b";

const hashPairs = [];
for (let j = 0; j < 32; j++) {
  hashPairs.push(txHash.slice(2 + j * 2, 4 + j * 2));
}

const decPairs = hashPairs.map((x) => {
  return parseInt(x, 16);
});

const fps = 30;

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  dim = width / 2;
  colorMode(HSB, 360, 100, 100);
  ellipseMode(RADIUS);
  frameRate(fps);

  clearStorage();
}

function draw() {
  angleMode(DEGREES);

  translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
  noFill();

  let colorMin = (decPairs[0] / 255) * 360;
  let colorMax = (decPairs[1] / 255) * 360;
  if (colorMin > colorMax) {
    let tempColorMin = colorMin;
    colorMin = colorMax;
    colorMax = tempColorMin;
  }
  let colorIncrement = 1;

  let yFixed = decPairs[3] % 2 === 1;
  let currYStart, yMin, yMax;
  if (yFixed) {
    currYStart = (decPairs[3] / 255) * MAX_FIXED_Y;
  } else {
    yMin = ((decPairs[4] / 255) * CANVAS_SIZE) / 4;
    yMax = ((decPairs[5] / 255) * CANVAS_SIZE) / 2 + CANVAS_SIZE / 2;
  }

  let yIncrementFixed = decPairs[6] % 2 === 1;
  let yIncrement;
  if (yIncrementFixed) {
    yIncrement = Math.floor((decPairs[7] / 255) * 3) + 1;
  } else {
    // TODO: Dynamic yIncrement
  }

  let diameterFixed = decPairs[9] % 2 === 1;
  let currDiameterStart;
  if (diameterFixed) {
    currDiameterStart = (decPairs[10] / 255) * 100;
  }

  let diaMin = 1;
  let diaMax = 30;
  let diaIncrement = 1;

  for (let i = 0; i < 90; i++) {
    // Get dynamic color
    let currColor = getItem(`currColor[${i}]`);
    let colorIncrementing = !!getItem(`colorIncrementing[${i}]`);

    if (!currColor && currColor !== 0) {
      currColor = randomIntFromInterval(colorMin, colorMax);
    } else {
      const { value, newIncrementing } = incrementInRange(
        currColor,
        colorMin,
        colorMax,
        colorIncrementing,
        colorIncrement
      );
      currColor = value;
      storeItem(`colorIncrementing[${i}]`, newIncrementing);
    }

    // Get current y
    if (!!getItem(`currY[${i}]`)) {
      currY = getItem(`currY[${i}]`);
      if (currY > CANVAS_SIZE) {
        currY = currYStart;
      }
    } else {
      currY = currYStart;
    }

    if (!yFixed) {
      // Dynamic
      let yIncrementing = !!getItem(`yIncrementing[${i}]`);
      if (!currY && currY !== 0) {
        currY = randomIntFromInterval(yMin, yMax);
      } else {
        const { value, newIncrementing } = incrementInRange(
          currY,
          yMin,
          yMax,
          yIncrementing,
          yIncrement
        );
        currY = value;
        storeItem(`yIncrementing[${i}]`, newIncrementing);
      }
    } else {
      // Fixed
      currY = currY += yIncrement;
    }

    // Get current diameter
    if (!!getItem(`currDiameter[${i}]`)) {
      currDiameter = getItem(`currDiameter[${i}]`);
    } else {
      currDiameter = currDiameterStart;
    }

    let diaIncrementing = !!getItem(`diaIncrementing[${i}]`);

    if (!currDiameter && currDiameter !== 0) {
      currDiameter = randomIntFromInterval(diaMin, diaMax);
    } else {
      const { value, newIncrementing } = incrementInRange(
        currDiameter,
        diaMin,
        diaMax,
        diaIncrementing,
        diaIncrement
      );
      currDiameter = value;
      storeItem(`diaIncrementing[${i}]`, newIncrementing);
    }

    storeItem(`currColor[${i}]`, currColor);
    storeItem(`currY[${i}]`, currY);
    storeItem(`currDiameter[${i}]`, currDiameter);
    fill(currColor, 90, randomIntFromInterval(70, 90));
    noStroke();
    circle(0, currY, currDiameter);
    rotate(5);
  }
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function incrementInRange(value, min, max, incrementing, incrementAmt) {
  if (value <= max && value >= min) {
    if (incrementing) {
      value += incrementAmt;
    } else {
      value -= incrementAmt;
    }
  } else {
    incrementing = !incrementing;
    if (value < min) {
      value += incrementAmt;
    }
    if (value > max) {
      value -= incrementAmt;
    }
  }
  return { value, newIncrementing: incrementing };
}
