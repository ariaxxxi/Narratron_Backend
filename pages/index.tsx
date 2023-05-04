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


export default function Home() {

  //var five = require('johnny-five');
  // const [message, setMessage] = useState('');
  const [image, updateImage] = useState("");
  const [text, updateText] = useState("");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState(["Create your story!"]);

  // Initialize the prompt for story and image
  const [quote, setQuote] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteLoadingError, setQuoteLoadingError] = useState(false);
  let arduinoData: any;

  // async function openPort() {
    // const sp = new SerialPort({path: 'COM6', baudRate: 9600});
    // sp.open(function(err) {
    //   if (err) {
    //     return console.log(err.message);
    //   }
    // });
    // let k = 0;
    // sp.on('open', function() {
    //   k = 1;
    //   console.log("Serial Port Opened");
    // });
  
    // sp.on('data', function(data) {
    //   console.log(data[0])
    //   arduinoData = data[0];
    // });
  // }

  


  //const TeachableMachine = require("@sashido/teachablemachine-node");
  const URL = "https://teachablemachine.withgoogle.com/models/7M2dW0YzA/";

  let model: any, webcam: any, labelContainer: any, maxPredictions: any, webcamContainer: any, target: any;

  // Integrate the teacheable machine model and webcam inputs.
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
    await webcam.setup(); // request access to the webcam
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

  async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
  }

  // run the webcam image through the image model
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
      }
  }

  // Submit button script
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    //const prompt = formData.get("prompt")?.toString().trim();
    const prompt = target;

    if (prompt) {
      try {
        setQuote("");
        setQuoteLoadingError(false);
        setQuoteLoading(true);

        const response = await fetch("/api/generate?prompt=" + encodeURIComponent(prompt));
        const body = await response.json();
        setQuote(body.responseData.story);
        setImagePrompt(body.responseData.imagePrompt);

      } catch (error) {
        console.error(error);
        setQuoteLoadingError(true);
      } finally {
        setQuoteLoading(false);
      }
    }
  }

  // Image generation that connects to SD backend hook
  async function updateSentences(){
    const prompt = target;

    if (prompt) {
      try {
        setQuote("");
        setQuoteLoadingError(false);
        setQuoteLoading(true);

        const response = await fetch("/api/generate?prompt=" + encodeURIComponent(prompt));
        const body = await response.json();
        setQuote(body.responseData.story);
        setImagePrompt(body.responseData.imagePrompt);

      } catch (error) {
        console.error(error);
        setQuoteLoadingError(true);
      } finally {
        setQuoteLoading(false);
      }
    }
    if (quote == undefined){
      setSentences(["Story time! Click Next to start the story."])
    }
    else{
      setSentences(quote.split(/[\.\?!]['"]?\s+/));
    }
  }

  const handleNextClick = () => {
    if (sentenceIndex < 5) {
      setSentenceIndex(sentenceIndex + 1);
    }
  };

    // send to sd to get image
  const generateImage = async (text: any) =>{
    const imageResult = await axios.get(`http://127.0.0.1:8000/?text=${imagePrompt[sentenceIndex+1]} by Hayao Miyazaki`)
    updateImage(imageResult.data)
  }


  return (
    <main className={styles.main}>
      <h1>Fairy Tale GPT</h1>
      <div>Generate a fairy tale based on hand gesture.</div>
      {/* <Form onSubmit={handleSubmit} className={styles.inputForm}>
        <Form.Group className='mb-3' controlId='prompt-input'>
          <Form.Label>Type an animal to start...</Form.Label>
          <Form.Control
            name='prompt'
            placeholder='e.g. cat, dog, bunny'
            maxLength={100}
          />
        </Form.Group>
        <Button type='submit' className='mb-3' disabled={quoteLoading}>Tell me a story!</Button>
    
  
      </Form> */}
      <Button type='button' onClick={updateSentences} disabled={quoteLoading}>Capture</Button>
      <Button onClick = {e => {
                  handleNextClick();
                  generateImage(text);
                  updateSentences();
                }} >Next</Button>

      { quoteLoading && <Spinner animation='border' />}
      { quoteLoadingError && "Something went wrong"}
      {/* { quote && <h5>{quote}</h5>} */}
      { sentences[sentenceIndex] && <h5>{sentences[sentenceIndex]}</h5>}
      {/* { sentenceIndex && <h5>{quote}</h5>} */}
      <div>{arduinoData}</div>
      <div>1</div>
      <Button type="button" onClick={init}>Start</Button>
      {image ?<Image src={`data:image.png;base64,${image}`} alt="image" width="600" height="600"/> : null} 
      <div id="webcam-container"></div>
      <div id="label-container"></div>

    </main>
  )
}
