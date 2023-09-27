from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
from auth_token import auth_token
import base64
import requests  
import replicate
from dotenv import load_dotenv


load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

lora_url = "https://replicate.delivery/pbxt/lxNOXRnkcqYADhf5X6WUIQqzBGR0VhLY53JpTi0FuGInYRdIA/tmpqudyfillcartoon_datazip.safetensors"

@app.get("/")
def generate(text: str):
    try:
        output = replicate.run(
                "cloneofsimo/lora:fce477182f407ffd66b94b08e761424cabd13b82b518754b83080bc75ad32466", 
                input={"prompt": text +'in the style of <1>' ,
                    "lora_urls": lora_url})

        response  = requests.get(output[0])
        image_data = response.content
        image = Image.open(BytesIO(image_data))
        image.save("image.png")

        buffer = BytesIO()
        image.save(buffer, format="PNG")
        imgstr = base64.b64encode(buffer.getvalue())

        return Response(imgstr, media_type="image/png")
    
    except Exception as e:
        return {"error": str(e)}

