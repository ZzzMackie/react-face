import { HfInference } from '@huggingface/inference'
import Image from 'next/image'
import { useState } from 'react'
const client = new HfInference(process.env.NEXT_PUBLIC_HF_ID)
console.log(process.env.NEXT_PUBLIC_HF_ID)
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
  return <div onClick={handlerImage}>Huggingface
    <Image
        src={image}
        width={500}
        height={500}
        alt="Picture of the author"
        />
  </div>;
}