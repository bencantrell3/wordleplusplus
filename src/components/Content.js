import { useState } from 'react';


//WORD LISTS SETUP///////////////////////////////////////////////////////////////////////////////////////////////////////
let fetchedHtml = "";
let archive = [];
let optionElements = [];
async function fetchData() {
  try {
    const response = await fetch('https://corsproxy.io/?https://wordfinder.yourdictionary.com/wordle/answers/?' + new Date().getTime() + '');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    fetchedHtml = await response.text();
    //console.log(fetchedHtml);
    const regex = /\b[A-Z]{5}\b/g; // Regex to match 5 consecutive uppercase letters
    const matches = fetchedHtml.match(regex) || [];
    matches.shift();//ignores the "CIGAR" in the blog post
    matches.splice(matches.indexOf("CIGAR") + 1);//removes the duplicate instances of all words
    archive = matches.reverse();
    console.log(matches);
    optionElements = [];
    for (let i = 0; i < archive.length; i++) { 
      optionElements.unshift(
        <option value={archive[i]}>{"Wordle #" + i}</option>
      );
    }
    //console.log(archive); // Output the matches found
  } catch (error) {
    console.error('ERROR FETCHING ARCHIVE', error);
  }
}

await fetchData();

let validWords = [];
function fetchAndLogTextFile() {
  fetch('https://bencantrell3.github.io/WordleWebApp/allWords.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error(`ERROR FETCHING ALL WORDS ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      const lines = text.split(/\r\n|\n/);
      lines.forEach((line, index) => {
        validWords.push(`${line}`);
      });
    })
    .catch(error => {
      console.error('ERROR FETCHING ALL WORDS', error);
    });
}
let allAnswers = [];
function fetchAndLogTextFile2() {
  fetch('https://bencantrell3.github.io/WordleWebApp/allAnswers.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error(`ERROR FETCHING ALL ANSWERS ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      const lines = text.split(/\r\n|\n/);
      lines.forEach((line, index) => {
        allAnswers.push(`${line}`);
      });
    })
    .catch(error => {
      console.error('ERROR FETCHING ALL ANSWERS', error);
    });
}

fetchAndLogTextFile();
fetchAndLogTextFile2();

//VARIABLE INITIALIZATION////////////////////////////////////////////////////////////////////////////////////////////////////
let globalBlur = false;
let canClickSideBar = false;
let canClickArchive = false;
let locked = false;
const RED = 'rgb(255, 0 ,0';
const SOFTRED = 'rgb(100,44,44';
const GREEN = 'rgb(43, 166, 55)';
const YELLOW = 'rgb(201, 188, 40)';
const BLUE = 'rgb(52, 103, 235)';
const ORANGE = 'rgb(255, 128, 13)';
const PURPLE = 'rgb(245, 32, 245)';
const BLACK = 'rgb(0, 0, 0)';
const DARKGRAY = 'rgb(23, 23, 23)';
const LIGHTGRAY = 'rgb(44, 44, 44';
const LIGHTLIGHTGRAY = 'rgb(100,100,100)';
const WHITE = 'rgb(255, 255, 255';
let gameModeColor = GREEN;
let answer = archive[archive.length-1].toLowerCase();
let board = [[],[],[],[],[],[]];//2d array of every letter
let colorArr = [[],[],[],[],[],[]];//2s array of board colors
let qwertyColors = [LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY];
let index = 0;//current row
let currentGuess = [];//current guess
let keyAdded = false;//used to validate an event listener is only added once
let qwertyList = ["Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","ENTER","Z","X","C","V","B","N","M","BACK"]//qwerty board
let challengeWords = ["parer","mummy","jazzy","foyer","riper","joker","judge","nanny","piper","kazoo","verve","hunch","gawky","cower","sassy","fewer","coyly","dandy","froze","magma","daddy","prize","gully","baker","woken","glaze","homer","fluff","buggy","hunky","gauze","booze","howdy","borax","folly","brook","ember","expel","verge","forgo","vouch","goose","sever","ruder","taunt","enjoy","ionic","catch","revel","hound","guppy","hater","ninja","stash"];
function Content() {

  if(!keyAdded){
    window.addEventListener('keydown', handleKeyPress);
  }

  keyAdded = true;

  //USESTATES: CURRENT GUESS AND COLORS. //////////////////////////////////////////////////////////////////////////////////
  let [currentWord, setCurrentWord] = useState([]);
  let [colors, setColors] = useState([LIGHTGRAY,LIGHTGRAY,LIGHTGRAY,LIGHTGRAY,LIGHTGRAY]);
  let [opac, setOpac] = useState(0);
  let [archiveOpac, setArchiveOpac] = useState(0);
  let [selectedOption, setSelectedOption] = useState('');
  let [streakCount, setStreakCount] = useState(0);
  let [showInfo, setShowInfo] = useState(false);
  //INLINE STYLING OF COMPONENTS///////////////////////////////////////////////////////////////////////////////////////////////
  let background = () => {
    let style = {
    width: '100vw',                /* Set the width of the circle */
    height: '100vh',               /* Set the height of the circle */
    backgroundColor: LIGHTGRAY,      /* Set the background color of the circle */
    /*border-radius: 50%;          /* Make the element round */
    position: 'absolute',       /* Use absolute positioning */
    top: '50%',                    /* Center vertically */
    right: '0',                /* Position it at the right edge */
    transform: 'translateY(-50%)',
    };
    return(
      <div style={style}>{}</div>
    )
  }

  let title = () => {
    let text = 'WORDLE++';
    let style = {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '8vh',
    top: '0',
    width: '100%',
    fontFamily:"'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', 'Arial', 'sans-serif'",//pretty sure this isnt picking up everything
    fontSize: '4vh',
    backgroundColor: BLACK,
    color: gameModeColor,
    //padding: '1rem',
    boxShadow: "0 2px 4px rgb(0, 0, 0, 0.1)",
    border: '4px solid ' + gameModeColor,
    };
    return(
      <div style={style}>{text}</div>
    )
  }

  let qwerty = (top, offset, text, size, colorArg) => {
    let blurVar = '';
    if(globalBlur){
      blurVar = 'blur(5px)';
    }
    let topVar = '' + top + 'vh';
    let offsetVar = 'calc(50% + ' + offset + 'vh)';
    let style = {
      filter: blurVar,
      width: '5vh',            
      height: '6vh' ,         
      backgroundColor: colorArg,
      color: WHITE,
      position:'fixed',
      top: topVar,              
      right: offsetVar, 
      transform: 'translateY(-50%)',
      border: '0.5vh solid ' + DARKGRAY,
      //padding: '10px',
      //margin: '20px',
      borderRadius: '10px',
      fontSize: ''+ size + 'vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };  
    if(text == "BACK"){
      return(
        <div style={style} onClick={() => handleBackspace()}>{text}</div>
      )
    }
    else if(text == "ENTER"){
      return(
        <div style={style} onClick={() => handleEnter()}>{text}</div>
      )
    }
    return(
      <div style={style} onClick={() => handleQwerty(text)}>{text}</div>
    )
  }
  
  let Square = (top, offset, letter, colorX) => {
    let blurVar = '';
    if(globalBlur){
      blurVar = 'blur(5px)';
    }
    let topVar = '' + top + 'vh';
    let offsetVar = 'calc(50% + ' + offset + 'vh)';
    let style = {
      filter: blurVar,
      width: '7.4vh',            
      height: '7.4vh' ,         
      backgroundColor: colorX,
      position:'fixed',
      top: topVar,              
      right: offsetVar,       
      transform: 'translateY(-50%)',
      border: '4px solid ' + DARKGRAY,
      //padding: '5px',
      //margin: '20px',
      fontSize: '8vh',
      alignItems: 'center',         // Centers items vertically
      justifyContent: 'center',     // Centers items horizontally
      textAlign: 'center',  
      lineHeight: '0.8',    
      color: WHITE,
    };
    return(
      <div style={style}>{letter}</div>
    )
  }
  
  let streakSquare = (top, offset, letter, colorX) => {
    let sizeFont = '8vh';
    let heightLine = '0.8';
    if(streakCount / 10 >= 1){
      sizeFont = '6vh';
      heightLine = '1.1';
    }
    let blurVar = '';
    if(globalBlur){
      blurVar = 'blur(5px)';
    }
    let topVar = '' + top + 'vh';
    let offsetVar = 'calc(50% + ' + offset + 'vh)';
    let style = {
      filter: blurVar,
      width: '7.4vh',            
      height: '7.4vh' ,         
      backgroundColor: colorX,
      position:'fixed',
      top: topVar,              
      right: offsetVar,       
      transform: 'translateY(-50%)',
      border: '4px solid ' + ORANGE,
      //padding: '5px',
      //margin: '20px',
      fontSize: sizeFont,
      alignItems: 'center',         // Centers items vertically
      justifyContent: 'center',     // Centers items horizontally
      textAlign: 'center',  
      lineHeight: heightLine,    
      color: WHITE,
    };
    return(
      <div style={style}>{letter}</div>
    )
  }


  let todaysWordleStyle = {
    width: '28vw',            
    height: '4vh' ,         
    backgroundColor: BLACK,
    position:'fixed',
    top: '10vh',              
    left: '1vw',       
    border: '4px solid ' + GREEN,
    padding: '5px',
    margin: '0px',
    fontSize: '3vh',
    alignItems: 'center',         // Centers items vertically
    justifyContent: 'center',     // Centers items horizontally
    textAlign: 'center',  
    lineHeight: '1.2',    
    color: GREEN,
    borderRadius: '10px',
  }

  let randomStyle = {
    width: '28vw',            
    height: '4vh' ,         
    backgroundColor: BLACK,
    position:'fixed',
    top: '24vh',              
    left: '1vw',       
    border: '4px solid ' + PURPLE,
    padding: '5px',
    margin: '0px',
    fontSize: '3vh',
    alignItems: 'center',         // Centers items vertically
    justifyContent: 'center',     // Centers items horizontally
    textAlign: 'center',  
    lineHeight: '1.2',    
    color: PURPLE,
    borderRadius: '10px',
  }

  let challengeStyle = {
    width: '28vw',            
    height: '4vh' ,         
    backgroundColor: BLACK,
    position:'fixed',
    top: '31vh',              
    left: '1vw',       
    border: '4px solid ' + RED,
    padding: '5px',
    margin: '0px',
    fontSize: '3vh',
    alignItems: 'center',         // Centers items vertically
    justifyContent: 'center',     // Centers items horizontally
    textAlign: 'center',  
    lineHeight: '1.2',    
    color: RED,
    borderRadius: '10px',
  }

  let streakStyle = {
    width: '28vw',            
    height: '4vh' ,         
    backgroundColor: BLACK,
    position:'fixed',
    top: '38vh',              
    left: '1vw',       
    border: '4px solid ' + ORANGE,
    padding: '5px',
    margin: '0px',
    fontSize: '3vh',
    alignItems: 'center',         // Centers items vertically
    justifyContent: 'center',     // Centers items horizontally
    textAlign: 'center',  
    lineHeight: '1.2',    
    color: ORANGE,
    borderRadius: '10px',
  }

  let infoStyle = {
    width: '4vw',            
    height: '4vh' ,         
    backgroundColor: BLACK,
    position:'fixed',
    top: '45vh',              
    left: '1vw',       
    border: '4px solid ' + WHITE,
    padding: '5px',
    margin: '0px',
    fontSize: '3vh',
    alignItems: 'center',         // Centers items vertically
    justifyContent: 'center',     // Centers items horizontally
    textAlign: 'center',  
    lineHeight: '1.2',    
    color: WHITE,
    borderRadius: '10px',
  }



  let Sidebar = () => {
    let sideStyle = {
      width: '30vw',            
      height: '100vh' ,         
      backgroundColor: BLACK,
      position:'fixed',
      top: -20,              
      left: -20,       
      border: '4px solid ' + gameModeColor,
      padding: '5px',
      margin: '20px',
      fontSize: '8vh',
      alignItems: 'center',         // Centers items vertically
      justifyContent: 'center',     // Centers items horizontally
      textAlign: 'center',     
      color: WHITE,
      opacity: opac,
      pointerEvents: canClickSideBar ? 'auto' : 'none'
    };
    return(
      <div style={sideStyle}>{}
        <div style={todaysWordleStyle} onClick={handleTodaysWordle}>TODAY'S WORDLE</div>
        {archiveMenu}
        <div style={randomStyle} onClick={handleRandom}>RANDOM</div>
        <div style={challengeStyle} onClick={handleChallenge}>CHALLENGE</div>
        <div style={streakStyle} onClick={handleStreak}>STREAK</div>
        <div style={infoStyle} onMouseEnter={handleInfoEnter} onMouseLeave={handleInfoExit}>?</div>
      </div>
    )
  }
  
  let button = () => {
    let style = {
      width: '15vw',            
      height: '4vh',          
      fontSize: 'calc(1.5vw + 0.0vh)',
      alignItems: 'center',         // Centers items vertically
      justifyContent: 'center',     // Centers items horizontally
      textAlign: 'center',
      backgroundColor: BLACK,
      position: 'fixed',
      top: '4.5vh',              
      left: '2vh',      
      transform: 'translateY(-50%)',
      border: '4px solid ' + gameModeColor,
      lineHeight: '3.8vh',
      //padding: '10px',
      //margin: '20px',
      borderRadius: '10px',
      color: gameModeColor,
    };
    return(
      <div style={style} onClick={handleClick}>GAME MODES</div>
    )
  }
  
  let gameModeTitle = () => {
    let text = '';
    let fontVar = '1.5vh';
    if(gameModeColor === GREEN){
      text = "TODAY'S WORDLE";
      fontVar = '1.4vh';
    }
    else if(gameModeColor === BLUE){
      text = "ARCHIVE";
    }
    else if(gameModeColor === PURPLE){
      text = "RANDOM";
    }
    else if(gameModeColor === RED){
      text = "CHALLENGE";
    }
    else if(gameModeColor === ORANGE){
      text = "STREAK";
    }
    let style = {
      width: '15vw',            
      height: '4vh',          
      fontSize: 'calc(1.5vw + 0.0vh)',
      alignItems: 'center',         // Centers items vertically
      justifyContent: 'center',     // Centers items horizontally
      textAlign: 'center',
      backgroundColor: BLACK,
      position: 'fixed',
      top: '4.5vh',              
      right: '2vh',         
      transform: 'translateY(-50%)',
      border: '4px solid ' + gameModeColor,
      borderRadius: '10px',
      color: gameModeColor,
      lineHeight: '3.8vh',
    };
    return(
      <div style={style} onClick={handleClick}>{text}</div>
    )
  }

  let endGameMessage = () => {
    let blurVar = '';
    if(globalBlur){
      blurVar = 'blur(5px)';
    }
    let style = {
      filter: blurVar,
      width: '45vh',            
      height: '4vh' ,         
      backgroundColor: LIGHTGRAY,
      position:'fixed',
      top: '66vh',              
      left: 'calc(50% + ' + -23 + 'vh)',
      transform: 'translateY(-50%)',
      border: '4px solid ' + gameModeColor,
      fontSize: '2vh',
      alignItems: 'center',         // Centers items vertically
      justifyContent: 'center',     // Centers items horizontally
      textAlign: 'center',  
      lineHeight: '1.9',    
      color: WHITE,
      borderRadius: '5px'
    };
    let message = '';
    if(gameModeColor === GREEN || gameModeColor === BLUE){
      message = "Select a New Game Mode";
    }
    else message = "Press Enter to Play Again";
    return(
      <div style={style}>The Word was: {answer.toUpperCase()}. {message}</div>
    )
  }

  let archiveMenu = () => {
    let style = {
      width: '29.5vw',            
      height: '6.2vh' ,         
      backgroundColor: BLACK,
      position:'fixed',
      top: '16.7vh',              
      left: '1vw',       
      border: '4px solid ' + BLUE,
      padding: '0vh',
      margin: '0vh',
      fontSize: '3vh',
      alignItems: 'center',         // Centers items vertically
      justifyContent: 'center',     // Centers items horizontally
      textAlign: 'center',  
      //lineHeight: '0.9',    
      color: BLUE,
      borderRadius: '10px',
      opacity: opac,
      pointerEvents: canClickSideBar ? 'auto' : 'none',
      fontFamily:"'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', 'Arial', 'sans-serif'",//pretty sure this isnt picking up everything

    }
    return(
      <select className="custom-select" style={style} onChange={handleChange}>
      <option>ARCHIVE</option>
      {optionElements}
    </select>
    )
  }

  let infoBox = () => {
    let style = {
      width: '45vw',            
      height: 'calc(30vh + 5vw)',          
      fontSize: 'calc(1.5vw + 0.0vh)',
      alignItems: 'center',         // Centers items vertically
      justifyContent: 'center',     // Centers items horizontally
      textAlign: 'left',
      backgroundColor: BLACK,
      padding: '1vh',
      position: 'fixed',
      top: 'calc(26vh + 2vw)',              
      left: '32vw',      
      transform: 'translateY(-50%)',
      border: '4px solid ' + WHITE,
      lineHeight: '6vh',
      borderRadius: '10px',
      color: WHITE,
    };
    return(
      <div style={style}>
      <p style={{color: GREEN, lineHeight: '1.7vh'}}>Play the official Wordle of the Day-Refreshes 6PM CST</p>
      <p style={{color: BLUE, lineHeight: '10vh'}}>Choose any official Wordle to play since its creation</p>
      <p style={{color: PURPLE, lineHeight: '1vh'}}>Play with a random word</p>
      <p style={{color: RED, lineHeight: '10vh'}}>Play with a pool of official Wordles with the highest fail rate</p>
      <p style={{color: ORANGE, lineHeight: '1.2vh'}}>See how many random words you can solve in a row</p>
      </div>
    )
  }
  

  //EVENT HANDLING////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function handleClick(){
    if(opac === 0){
      setOpac(opac = 100);
    }
    else setOpac(opac = 0);
    canClickSideBar = !canClickSideBar;
    globalBlur = !globalBlur;
  }

  function handleQwerty(input){
    if(locked)
      return;
    if(currentGuess.length < 5 && (input.length === 1 && input.match(/[a-zA-Z]/))){
      let newGuess = [...currentGuess, input.toUpperCase()];
      currentGuess = newGuess;
      board[index] = currentGuess;
      setCurrentWord(currentWord = currentGuess); 
    }
  }

  function handleBackspace(){
    currentGuess.pop();
    let newGuess = [...currentGuess];//these lines are redundant but fix the backspace bug
    currentGuess = newGuess;
    board[index] = currentGuess;
    setCurrentWord(currentWord = currentGuess); 
    colorArr[index] = [LIGHTGRAY, LIGHTGRAY, LIGHTGRAY, LIGHTGRAY, LIGHTGRAY];
  }

  function handleEnter(){
    if(locked && (gameModeColor === PURPLE || gameModeColor === RED || gameModeColor === ORANGE)){
      wipe();
    }
    let guessStr = (currentGuess[0] + '' + currentGuess[1] + '' + currentGuess[2] + '' + currentGuess[3] + '' + currentGuess[4]).toLowerCase();
    if(validWords.includes(guessStr)){
      let rowColors = processGuess(guessStr);
      colorArr[index] = [rowColors[0], rowColors[1], rowColors[2], rowColors[3], rowColors[4]];
      setColors(colors = [rowColors[0], rowColors[1], rowColors[2], rowColors[3], rowColors[4]]);
      setCurrentWord(currentWord = currentGuess);
      index++;
      if(index > 5){
        handleEnd();
      }
      currentGuess = [];
      board[index] = currentGuess;
    }
    else{
      colorArr[index] = [SOFTRED,SOFTRED,SOFTRED,SOFTRED,SOFTRED];
      setColors(colors = [SOFTRED,SOFTRED,SOFTRED,SOFTRED,SOFTRED]);
      if(currentGuess.length === 0){
        colorArr[index] = [LIGHTGRAY,LIGHTGRAY,LIGHTGRAY,LIGHTGRAY,LIGHTGRAY];
        setColors(colors = [LIGHTGRAY,LIGHTGRAY,LIGHTGRAY,LIGHTGRAY,LIGHTGRAY]);
      }
    }
  }
  
  function handleKeyPress(event){
      if(event.key === 'Backspace'){
        handleBackspace();
      }
      else if(currentGuess.length < 5 && (event.key.length === 1 && event.key.match(/[a-zA-Z]/))){
        handleQwerty(event.key.toString().toUpperCase());
      } 
      else if((event.key === 'Enter' && currentGuess.length === 5) || locked){
        handleEnter();
      }  
  }

  function handleTodaysWordle(){
    gameModeColor = GREEN;
    wipe();
    //console.log("ARCHIVE[0] = " + archive[archive.length-1]);
    answer = archive[archive.length-1].toLowerCase();
    //console.log("ANSWER = " + answer);
    handleClick(); 
  }

  function handleArchive(){
    gameModeColor = BLUE;
    if(archiveOpac === 0){
      setArchiveOpac(archiveOpac = 100);
    }
    else setArchiveOpac(archiveOpac = 0);
    canClickArchive = !canClickArchive;
  }
    
  function handleRandom(){
    gameModeColor = PURPLE;

    wipe();
    answer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
    //console.log(answer);
    handleClick();
  }

  function handleChallenge(){
    gameModeColor = RED;
    wipe();
    answer = challengeWords[Math.floor(Math.random() * challengeWords.length)];
    handleClick();
  }

  function handleStreak(){
    gameModeColor = ORANGE;
    wipe();
    answer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
    handleClick();
  }

  function handleInfoEnter(){
    setShowInfo(showInfo = true);
  }

  function handleInfoExit(){
    setShowInfo(showInfo = false);
  }

  const handleChange = (event) => {
    wipe();
    gameModeColor = BLUE;
    setSelectedOption(selectedOption = event.target.value);
    //console.log("SELECTED OPTION: " + selectedOption);
    
    answer = selectedOption.toLowerCase();
    canClickArchive = false;
    setArchiveOpac(archiveOpac = 0);
    handleClick();
  };

  //GUESS CHECK LOGIC//////////////////////////////////////////////////////////////////////////////////////////////////
  function processGuess(currentGuess){
      let retArray = [DARKGRAY,DARKGRAY,DARKGRAY,DARKGRAY,DARKGRAY];
      let temp = answer;
      for(let i = 0; i < temp.length;i++){
        qwertyColors[qwertyList.indexOf(currentGuess[i].toUpperCase())] = DARKGRAY;
      }
      //green logic
      if(currentGuess[0] === answer[0]){
        retArray[0] = GREEN;
        qwertyColors[qwertyList.indexOf(currentGuess[0].toUpperCase())] = GREEN;
        temp = temp.substring(1);
      }
      if(currentGuess[1] === answer[1]){
        retArray[1] = GREEN;
        qwertyColors[qwertyList.indexOf(currentGuess[1].toUpperCase())] = GREEN;
        temp = temp.substring(0,temp.indexOf(answer[1])) + temp.substring(temp.indexOf(answer[1])+1,temp.length);
      }
      if(currentGuess[2] === answer[2]){
        retArray[2] = GREEN;
        qwertyColors[qwertyList.indexOf(currentGuess[2].toUpperCase())] = GREEN;
        temp = temp.substring(0,temp.indexOf(answer[2])) + temp.substring(temp.indexOf(answer[2])+1,temp.length);
      }
      if(currentGuess[3] === answer[3]){
        retArray[3] = GREEN;
        qwertyColors[qwertyList.indexOf(currentGuess[3].toUpperCase())] = GREEN;
        temp = temp.substring(0,temp.indexOf(answer[3])) + temp.substring(temp.indexOf(answer[3])+1,temp.length);
      }
      if(currentGuess[4] === answer[4]){
        retArray[4] = GREEN;
        qwertyColors[qwertyList.indexOf(currentGuess[4].toUpperCase())] = GREEN;
        temp = temp.substring(0,temp.indexOf(answer[4])) + temp.substring(temp.indexOf(answer[4])+1,temp.length);
      }
      if(temp === ''){
        if(gameModeColor === ORANGE){
          setStreakCount(streakCount = streakCount+1);
        }
        handleEnd();
      }
      //yellow logic
      if(temp.indexOf(currentGuess[0]) !== -1 && currentGuess[0] !== answer[0]){
        retArray[0] = YELLOW;
        qwertyColors[qwertyList.indexOf(currentGuess[0].toUpperCase())] = YELLOW;
        temp = temp.substring(0,temp.indexOf(currentGuess[0])) + temp.substring(temp.indexOf(currentGuess[0])+1,temp.length);
      }
      if(temp.indexOf(currentGuess[1]) !== -1 && currentGuess[1] !== answer[1]){
        retArray[1] = YELLOW;
        qwertyColors[qwertyList.indexOf(currentGuess[1].toUpperCase())] = YELLOW;
        temp = temp.substring(0,temp.indexOf(currentGuess[1])) + temp.substring(temp.indexOf(currentGuess[1])+1,temp.length);
      }
      if(temp.indexOf(currentGuess[2]) !== -1 && currentGuess[2] !== answer[2]){
        retArray[2] = YELLOW;
        qwertyColors[qwertyList.indexOf(currentGuess[2].toUpperCase())] = YELLOW;
        temp = temp.substring(0,temp.indexOf(currentGuess[2])) + temp.substring(temp.indexOf(currentGuess[2])+1,temp.length);
      }
      if(temp.indexOf(currentGuess[3]) !== -1 && currentGuess[3] !== answer[3]){
        retArray[3] = YELLOW;
        qwertyColors[qwertyList.indexOf(currentGuess[3].toUpperCase())] = YELLOW;
        temp = temp.substring(0,temp.indexOf(currentGuess[3])) + temp.substring(temp.indexOf(currentGuess[3])+1,temp.length);
      } 
      if(temp.indexOf(currentGuess[4]) !== -1 && currentGuess[4] !== answer[4]){
        retArray[4] = YELLOW;
        qwertyColors[qwertyList.indexOf(currentGuess[4].toUpperCase())] = YELLOW;
        temp = temp.substring(0,temp.indexOf(currentGuess[4])) + temp.substring(temp.indexOf(currentGuess[4])+1,temp.length);
      }
      if(index === 5 && temp !== ''){
        if(gameModeColor === ORANGE){
          setStreakCount(streakCount = 0);
        }
      }
      return retArray;

  }

  function wipe(){
    locked = false;
    board = [[],[],[],[],[],[]];//2d array of every letter
    colorArr = [[],[],[],[],[],[]];//2s array of board colors
    qwertyColors = [LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY,LIGHTLIGHTGRAY];
    index = 0;//current row
    currentGuess = [];//current guess
    if(gameModeColor === PURPLE){
      answer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
    }
    else if(gameModeColor === RED){
      answer = challengeWords[Math.floor(Math.random() * challengeWords.length)];
    }
    else if(gameModeColor === ORANGE){
      answer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
    }
  }

  function handleEnd(){
    locked = true;
  }


  //JSX//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <>
      
      {background()}
      {title()}
      {console.log(answer)}
      
      {Square(14,14,board[0][0], colorArr[0][0])}
      {Square(14,5,board[0][1], colorArr[0][1])}
      {Square(14,-4,board[0][2], colorArr[0][2])}
      {Square(14,-13,board[0][3], colorArr[0][3])}
      {Square(14,-22,board[0][4], colorArr[0][4])}

      {Square(23,14,board[1][0], colorArr[1][0])}
      {Square(23,5,board[1][1], colorArr[1][1])}
      {Square(23,-4,board[1][2], colorArr[1][2])}
      {Square(23,-13,board[1][3], colorArr[1][3])}
      {Square(23,-22,board[1][4], colorArr[1][4])}

      {Square(32,14,board[2][0], colorArr[2][0])}
      {Square(32,5,board[2][1], colorArr[2][1])}
      {Square(32,-4,board[2][2], colorArr[2][2])}
      {Square(32,-13,board[2][3], colorArr[2][3])}
      {Square(32,-22,board[2][4], colorArr[2][4])}

      {Square(41,14,board[3][0], colorArr[3][0])}
      {Square(41,5,board[3][1], colorArr[3][1])}
      {Square(41,-4,board[3][2], colorArr[3][2])}
      {Square(41,-13,board[3][3], colorArr[3][3])}
      {Square(41,-22,board[3][4], colorArr[3][4])}

      {Square(50,14,board[4][0], colorArr[4][0])}
      {Square(50,5,board[4][1], colorArr[4][1])}
      {Square(50,-4,board[4][2], colorArr[4][2])}
      {Square(50,-13,board[4][3], colorArr[4][3])}
      {Square(50,-22,board[4][4], colorArr[4][4])}

      {Square(59,14,board[5][0], colorArr[5][0])}
      {Square(59,5,board[5][1], colorArr[5][1])}
      {Square(59,-4,board[5][2], colorArr[5][2])}
      {Square(59,-13,board[5][3], colorArr[5][3])}
      {Square(59,-22,board[5][4], colorArr[5][4])}

      {gameModeColor === ORANGE && streakSquare(14,-31,streakCount+'', LIGHTGRAY)}

      
      {qwerty(73, 32.9, qwertyList[0],3, qwertyColors[0])}
      {qwerty(73, 24.9, qwertyList[1],3, qwertyColors[1])}
      {qwerty(73, 16.9, qwertyList[2],3, qwertyColors[2])}
      {qwerty(73, 8.9, qwertyList[3],3, qwertyColors[3])}
      {qwerty(73, 0.9, qwertyList[4],3, qwertyColors[4])}
      {qwerty(73, -7.1, qwertyList[5],3, qwertyColors[5])}
      {qwerty(73, -15.1, qwertyList[6],3, qwertyColors[6])}
      {qwerty(73, -23.1, qwertyList[7],3, qwertyColors[7])}
      {qwerty(73, -31.1, qwertyList[8],3, qwertyColors[8])}
      {qwerty(73, -39.1, qwertyList[9],3, qwertyColors[9])}

      {qwerty(82, 28.8, qwertyList[10],3, qwertyColors[10])}
      {qwerty(82, 20.8, qwertyList[11],3, qwertyColors[11])}
      {qwerty(82, 12.8, qwertyList[12],3, qwertyColors[12])}
      {qwerty(82, 4.8, qwertyList[13],3, qwertyColors[13])}
      {qwerty(82, -3.2, qwertyList[14],3, qwertyColors[14])}
      {qwerty(82, -11.2, qwertyList[15],3, qwertyColors[15])}
      {qwerty(82, -19.2, qwertyList[16],3, qwertyColors[16])}
      {qwerty(82, -27.2, qwertyList[17],3, qwertyColors[17])}
      {qwerty(82, -35.2, qwertyList[18],3, qwertyColors[18])}

      {qwerty(91, 28.8, qwertyList[19],2, qwertyColors[19])}
      {qwerty(91, 20.8, qwertyList[20],3, qwertyColors[20])}
      {qwerty(91, 12.8, qwertyList[21],3, qwertyColors[21])}
      {qwerty(91, 4.8, qwertyList[22],3, qwertyColors[22])}
      {qwerty(91, -3.2, qwertyList[23],3, qwertyColors[23])}
      {qwerty(91, -11.2, qwertyList[24],3, qwertyColors[24])}
      {qwerty(91, -19.2, qwertyList[25],3, qwertyColors[25])}
      {qwerty(91, -27.2, qwertyList[26],3, qwertyColors[26])}
      {qwerty(91, -35.2, qwertyList[27],2, qwertyColors[27])}


      {locked && endGameMessage()}
      {Sidebar()}
      {button()}
      {gameModeTitle()}
      {opac === 100 && archiveMenu()}
      {showInfo && infoBox()}
    </>
  )
}

export default Content;