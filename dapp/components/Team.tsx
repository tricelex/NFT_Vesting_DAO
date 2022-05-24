import Image from "next/image";

import Creator from "../public/assets/creator.png";

export default function Team() {
  return (
    <>
     <h2 className="text-4xl mb-4">TEAM</h2>
      <div className="grid grid-cols-2 grid-rows-2 grid-flow-col gap-4">
        <div className="text-center">
          <h2 className="text-2xl text-gray-100 mb-4">Developer</h2>
          <Image
            src={Creator}
            alt="Glupta"
            width={200}
            height={200}
            className="rounded-full"
          />
          <p className="mt-4">
            <a
              href="https://twitter.com/#"
              rel="noopener noreferrer"
              target="_blank"
              className="text-blue-500 hover:text-blue-400"
            >
              <span className="bg-gray-900 rounded-full px-4 py-2">
                @glupta
              </span>
            </a>
          </p>
        </div>
        <div className="text-center">
          <h2 className="text-2xl text-gray-100 mb-4">Developer</h2>
          <Image
            src={Creator}
            alt="Under"
            width={200}
            height={200}
            className="rounded-full"
          />
          <p className="mt-4">
            <a
              href="https://twitter.com/#"
              rel="noopener noreferrer"
              target="_blank"
              className="text-blue-500 hover:text-blue-400"
            >
              <span className="bg-gray-900 rounded-full px-4 py-2">
                @Under
              </span>
            </a>
          </p>
        </div>
        <div className="text-center">
          <h2 className="text-2xl text-gray-100 mb-4">Developer</h2>
          <Image
            src={Creator}
            alt="N8bour"
            width={200}
            height={200}
            className="rounded-full"
          />
          <p className="mt-4">
            <a
              href="https://twitter.com/#"
              rel="noopener noreferrer"
              target="_blank"
              className="text-blue-500 hover:text-blue-400"
            >
              <span className="bg-gray-900 rounded-full px-4 py-2">
                @n8bour
              </span>
            </a>
          </p>
        </div>
        <div className="text-center">
          <h2 className="text-2xl text-gray-100 mb-4">Developer</h2>
          <Image
            src={Creator}
            alt="Tricelex"
            width={200}
            height={200}
            className="rounded-full"
          />
          <p className="mt-4">
            <a
              href="https://twitter.com/#"
              rel="noopener noreferrer"
              target="_blank"
              className="text-blue-500 hover:text-blue-400"
            >
              <span className="bg-gray-900 rounded-full px-4 py-2">
                @Tricelex
              </span>
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
