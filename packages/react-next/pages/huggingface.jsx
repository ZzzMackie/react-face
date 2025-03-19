import { HfInference } from '@huggingface/inference'
import Image from 'next/image'
import { useState } from 'react'
const client = new HfInference(process.env.NEXT_PUBLIC_HF_ID)
console.log(process.env.NEXT_PUBLIC_HF_ID)
import { pipeline } from "@huggingface/transformers";

// Create automatic speech recognition pipeline
const transcriber = await pipeline(
  "automatic-speech-recognition",
  "onnx-community/whisper-tiny.en",
  { device: "webgpu" },
);

export default function Huggingface() {
    const [image, setImage] = useState(null)
    const handlerImage = async () => {
        const _image = await client.textToImage({
            provider: "replicate",
            model:"black-forest-labs/Flux.1-dev",
            inputs: "A black forest cake"
          })
          setImage(URL.createObjectURL(new Blob([_image])))
          console.log(URL.createObjectURL(URL.createObjectURL(new Blob([_image]))))
    }
    const handlerText = async () => {

        // Transcribe audio from a URL
        const url = "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav";
        const output = await transcriber(url);
        console.log(output);
    }
  return <div onClick={handlerText}>Huggingface
    <Image
        src={image}
        width={500}
        height={500}
        alt="Picture of the author"
        />
  </div>;
}