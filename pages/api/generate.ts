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
      {"role": "assistant", "content": "Rudy the cat was always up for an adventure. One morning, he wandered out of the house and into the garden, imersed in the sights and smells around him. Just then, he heard a rustling noise and he immediately assumed the worst; cats did not usually come by these parts! Bewildered, Rudy warily stepped forward, expecting danger, but what he saw astonished him - out from the undergrowth stepped a majestic lion! Rudy couldn't believe his eyes; the lion merely glanced at him with a gentle smile before bounding away! Rudy's heart was beating fast with excitement and he was filled with awe and reverence for this wonderful creature.\n Prompts:\n 1. A sun-dappled garden scene with soft touches of bright foliage.\n 2. Glinting beams of morning sunlight, cascading through the trees.\n 3. A fuzzy, out of focus view of some tall grass and wildflowers.\n 4. A peaceful river, winding under the shade of willow trees.\n 5. A magical meadow filled with colorful wildflowers and butterflies."},
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

console.log(sentences)
console.log(imagePrompt)

const responseData = {imagePrompt, sentences, quote};
if(textResponse){
  res.status(200).json({responseData});
}


}
