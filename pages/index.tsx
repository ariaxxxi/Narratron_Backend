import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Form, Button, Spinner } from 'react-bootstrap'
const inter = Inter({ subsets: ['latin'] })
import { FormEvent, useState, useEffect } from 'react'
//import { WebcamProps } from 'react-webcam'
import * as tmImage from '@teachablemachine/image'
import Webcam from 'react-webcam'
import axios from "axios"
import { SerialPort } from 'serialport'
import {useSpeechSynthesis} from 'react-speech-kit'
// import step1_img from './step1.png'


export default function Home() {

  //var five = require('johnny-five');
  // const [message, setMessage] = useState('');
  const [image, updateImage] = useState(" ");
  const [text, updateText] = useState("");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [story, setStory] = useState(["Act your hand shadow to start the story generation!"]);
  const [instruction, setInstruction] = useState("Act your hand shadow to start the story generation!");
  const [imageStep, setImageStep] = useState("/images/circle.png");
  const [imageStatus, setImageStatus] = useState("block");
  // Initialize the prompt for story and image
  const [quote, setQuote] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteLoadingError, setQuoteLoadingError] = useState(false);
  let arduinoData: any;

  var num = 0;


  

//#################### TEACHABLE MACHINE ####################
  //const TeachableMachine = require("@sashido/teachablemachine-node");
  // const URL = "https://teachablemachine.withgoogle.com/models/7M2dW0YzA/";
  const URL = "https://teachablemachine.withgoogle.com/models/0msH8WaA0/";

  let model: any, webcam: any, labelContainer: any, maxPredictions: any, webcamContainer: any, target: any;

  // TM:  Integrate the teacheable machine model and webcam inputs.
  async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam

    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    //await webcam.setup(); // request access to the webcam
    await webcam.setup({ deviceId: devices[1].deviceId });
    await webcam.play();
    window.requestAnimationFrame(loop);
    webcamContainer = document.getElementById("webcam-container");
    // append elements to the DOM
    webcamContainer.appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

  }


  // TM: webcam loop
  async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
  }

  // TM: run the webcam image through the image model
  async function predict() {
      // predict can take in an image, video or canvas html element
      const prediction = await model.predict(webcam.canvas);
      for (let i = 0; i < maxPredictions; i++) {
          const classPrediction =
              prediction[i].className + ": " + prediction[i].probability.toFixed(2);
          labelContainer.childNodes[i].innerHTML = classPrediction;
          if (prediction[i].probability.toFixed(2) > 0.9) {
              target = prediction[i].className;
          }
          // target = "bunny"
      }

      
  }

  // ###################################### OPENAI ######################################


  // ################### OPENAI: send keyword and Get story and image prompt ###################
  
  async function generateStory(){
    const prompt =  target;
    // detect story generation, if the story is not generated, loading...
    if (prompt) {
      try {
        setQuote("");
        setQuoteLoadingError(false);
        setQuoteLoading(true);
        setInstruction("Story is generating...")
        setImageStep("/images/loading.gif")

        const response = await fetch("/api/generate?prompt=" + encodeURIComponent(prompt));
        const body = await response.json();
        setQuote(body.responseData.quote);
        setImagePrompt(body.responseData.imagePrompt);

        setInstruction("Story is generated! Press next to start the story.")
        setImageStep("/images/spin.gif");

      } catch (error) {
        console.error(error);
        setQuoteLoadingError(true);
      } finally {
        setQuoteLoading(false);
      }
    }

    //After getting the story, split the story into sentences
    if (quote == undefined){
      setStory(["No story yet"])
    }
    else{
      setStory(quote.split(/[\.\?!]['"]?\s+/));
    }

    console.log ("story: " + story);

  }

 

  //  next chapter
  const handleNextClick = () => {
    if (sentenceIndex < 5) {
      setSentenceIndex(sentenceIndex + 1);
    }
    console.log("sentenceIndex:"+sentenceIndex);
  };



  // ######################### SD: Get image #########################
  const generateImage = async (text: any) =>{
    const imageResult = await axios.get(`http://127.0.0.1:8000/?text=${imagePrompt[sentenceIndex+1]} in cartoon style`)
    updateImage(imageResult.data)
  }

  // ######################### Voice Over #########################

  function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
}


  const {speak} = useSpeechSynthesis();

  async function handleSpeak ()  {
    await timeout(10000)
    speak({text: story[sentenceIndex+1], rate: 1.0});
  }

  async function updateToCircle ()  {
    await timeout(3000)
    setImageStep("/images/circle.png");
  }



 

  // ################### KEYBOARD ###################

  useEffect(() => {
   
    document.addEventListener ("keydown", handleKeyPress);

  }, []);

  const handleKeyPress = (event: any) => {
    console.log(event.key);
    // console.log("num: " + num);

    // start camera
    if (event.key == "Shift"){
      // init ();
      event.preventDefault();
      document.getElementById("start").click();
      console.log("start camera");
    }

    // //capture
    if (event.key == "Enter"){
      event.preventDefault();
      document.getElementById("capture").click();
      console.log("capture image");
    }

    if (event.key == "1"){
      event.preventDefault();
      document.getElementById("next").click();
    }


    //next sentence

    if (event.key == "ArrowRight"){
      //progress +1 until 10
      if (num < 10) { num += 1; }

      if (num == 10) {
        console.log("num: 10 - next chapter")
        num = 0;

        event.preventDefault();
        document.getElementById("next").click();
      }
      
    }
  };


  // ################### IMAGE DISPLAY ###################



  // ################### MAIN APP ###################
  // updateToCircle ()
  // init()

  return (
    <main className={styles.main}>
      {/* <h1>Fairy Tale GPT</h1>
      <div>Generate a fairy tale based on hand gesture.</div> */}
      
      
      <Button type="button" id="start" style={{ display: "block" }} onClick={init}>Start Camera</Button>

      <Button type='button' id="capture"style={{ display: "block" }} onClick={generateStory} disabled={quoteLoading}>Capture</Button>

      <Button type="button" id="next" style={{ display: "block" }} onClick = {e => {
                  console.log("button next")
                  setImageStatus("none");
                  handleNextClick();
                  generateImage(text);
                  generateStory();
                  handleSpeak();
                }} >Next</Button>
      {/* <Button onClick = {() => {handleSpeak();}}>Speak</Button> */}

      { quoteLoading && <Spinner animation='border' />}
      { quoteLoadingError && "Something went wrong"}
      {/* { sentenceIndex && <h5>{quote}</h5>} */}
      {/* { sentenceIndex && <h5>{sentenceIndex}</h5>} */}

      
      
      {image ?<Image src={imageStep} style={{ display: `${imageStatus}` }} alt="image" width="800" height="800"/> : null} 
      {/* {image ?<Image src={`data:image.png;base64,${image}`} alt="image" width="1080" height="1080"/> : null}  */}

     
      {/* {instruction && <h5>{instruction}</h5>} */}
     
      { story[sentenceIndex+1] && <h5>{story[sentenceIndex]}</h5>}

      <div id="webcam-container" style={{ display: "block" }}></div>
      <div id="label-container" style={{ display: "block" }} ></div>
      {/* style={{ display: "none" }} */}
    </main>
  )
}