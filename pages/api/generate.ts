// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({error: "Prompt missing"});
  }

  if (prompt.length > 100) {
    return res.status(400).json({error: "Prompt too long"});
  }

  //GPT3
  // const completion = await openai.createCompletion({
  //   model: "text-davinci-003",
  //   prompt: `Create a children story based on the following main character.\n
  //   Main character: ${prompt}\n
  //   Children Story:`,
  //   max_tokens: 500,
  //   temperature: 0.9,
  //   presence_penalty: 0,
  //   frequency_penalty: 0,
  // });


  // GPT3.5+
  // const completion = await openai.createChatCompletion({
  //   model: "gpt-3.5-turbo",
  //   messages: [
  //     {"role": "system", "content": "You are a children story writer that creates fairy tales for kids."},
  //     {"role": "user", "content": "Create a children story that has the main character of a duck"},
  //     {"role": "assistant", "content": "A farmer had a duck, which laid ten eggs. Soon, they all hatched. Of the ten, nine ducklings looked like the mom. The tenth one was big, gray and ugly. All the other ducklings made fun of the ugly one. Unhappy in the farm, the poor duckling ran away to a river nearby. There he sees white, beautiful swans. Afraid and lost, he wanted to drown in the river. But when he looked at his reflection in the river, he realized that he was not an ugly duckling, but a beautiful swan!"},
  //     {"role": "user", "content": "Create a children story that has the main character of a "+`${prompt}`},
  //   ],
  //   temperature: 0.9,
  //   max_tokens: 500,
  //   presence_penalty: 0,
  //   frequency_penalty: 0,
  // });

  // const quote = completion.data.choices[0].message?.content;

  // res.status(200).json({ quote });


  // GPT integration with Chat Completion
  
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      
    {"role": "system", "content": "You are a children story writer and designer that creates fairy tales for kids and generates stable diffusion prompt based on that story."},

    {"role": "user", "content": "Create a 5-sentence children story that has the main character of a duck and generate 5 prompts for stable diffusion."},

    {"role": "assistant", "content": "Once upon a time, there was an ugly duckling who was born into a family of ducks. He was constantly ridiculed and bullied for his appearance, so he ran away from home and found himself alone in the world. Over time, the duckling grew into a beautiful swan, and as he swam in a pond, the other animals marveled at his grace and beauty. They soon realized that the once-ugly duckling had transformed into a majestic swan. The swan was overjoyed to find that he belonged somewhere, and he lived the rest of his life surrounded by friends who loved him for who he truly was.\n Prompts:\n 1. A small pond with lush greenery and a bright blue sky. \n 2. A fuzzy, out of focus view of some tall grass and bushes, with glinting beams of morning sunlight. \n 3. A tranquil lake surrounded by lush green trees, with a beautiful swan swimming elegantly in the water. \n 4. A sun-dappled garden scene with soft touches of bright foliage. \n 5. A magical meadow filled with colorful wildflowers and butterflies."},

   {"role": "user", "content": "Create a 5-sentence children story that has the main character of a "+`${prompt}` + " and generate 5 prompts for stable diffusion."},
   ],
    temperature: 0.9,
    max_tokens: 500,
    presence_penalty: 0,
    frequency_penalty: 0,
   })
    

//const textResponse = response.data.choices[0].text;
const textResponse = response.data.choices[0].message?.content;
// console.log(textResponse)

const [originalStory, promptString] = textResponse.split('Prompts:');

const quote = "Turn the knob to start the story. " + originalStory;
const sentences = quote.split(/[\.\?!]['"]?\s+/);
const imagePrompt = promptString.split('\n').slice(1).map(prompt => prompt.trim());
imagePrompt.unshift("Prompt:");

console.log(quote)
console.log(imagePrompt)

const responseData = {imagePrompt, sentences, quote};
if(textResponse){
  res.status(200).json({responseData});
}


}
