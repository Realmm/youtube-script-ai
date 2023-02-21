import type { NextPage } from "next";
import { Configuration, OpenAIApi } from "openai";
import {
  FormEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";

const Home: NextPage = () => {
  const textRef = useRef(null);
  const [titles, setTitles] = useState<string[] | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const generated =
    titles !== undefined && description !== undefined && !loading;

  useEffect(() => {}, [titles, description, loading]);

  return (
    <>
      <div className="w-full h-full min-h-screen bg-gradient-to-br from-purple-700 to-black">
        <div className="bg-black w-full h-full min-h-screen bg-opacity-60 text-white font-roboto">
          <Title/>
          <div className={loading ? "w-full h-full m-auto pt-48" : "hidden"}>
            <div className="m-auto w-max text-center">
              <span>Generating titles and descriptions...</span>
              <br />
              <div className="mt-6 w-24 h-24 rounded-full border-8 border-gray-300 border-t-blue-500 animate-spin m-auto"></div>
            </div>
          </div>
          <div className={generated || loading ? "hidden" : ""}>
            <Description />
            <EnterScript
              textRef={textRef}
              setLoading={(state: boolean) => setLoading(state)}
              setTitlesAndDescription={(updatedTitles, updatedDesc) => {
                setTitles(updatedTitles);
                setDescription(updatedDesc);
              }}
            />
          </div>
          <div className={generated && !loading ? "py-4" : "hidden"}>
            <button
              onClick={() => {
                setTitles(undefined);
                setDescription(undefined);
              }}
              className="ml-10 lg:ml-20 bg-blue-500 px-4 py-2 text-black font-semibold rounded-lg mb-2 sm:mb-0"
            >
              <span>Go back</span>
            </button>
            <button
              onClick={async () => {
                const textValue =
                  (textRef.current as any)?.value === undefined ||
                  (textRef.current as any)?.value === ""
                    ? undefined
                    : (textRef.current as any).value;
                if (textValue === undefined) return;
                setLoading(true);
                const { titles, description } = await generateScripts(
                  textValue
                );
                setLoading(false);
                setTitles(titles);
                setDescription(description);
              }}
              className="ml-10 bg-blue-500 px-4 py-2 text-black font-semibold rounded-lg"
            >
              <span>Regenerate</span>
            </button>
            <div className="sm:flex w-full justify-center0">
              <ResultBox
                title="10 Youtube Titles"
                array={titles!!}
                titles={true}
              />
              <ResultBox
                title="Youtube Description"
                content={description!!}
                titles={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

type ResultBoxProps = {
  title: string;
  array?: string[];
  content?: string;
  titles: boolean;
};

const ResultBox = (props: ResultBoxProps) => {
  return (
    <>
      <div
        className="sm:w-140 mx-10 lg:mx-20 bg-white text-black rounded-xl p-4 h-max my-8"
      >
        <span className="font-semibold">{props.title}</span>
        <br />
        <br />
        <div className={props.array === undefined ? "hidden" : ""}>
          {formatArray(props.array!!)}
        </div>
        <div className={props.array === undefined ? "" : "hidden"}>
          <span>{props.content}</span>
        </div>
      </div>
    </>
  );
};

const formatArray = (array: string[]) => {
  if (array === undefined) return [];
  let formatted: any[] = [];
  array.forEach((val: string, i: number) => {
    formatted.push({
      index: i + 1,
      value: val,
    });
  });
  formatted = formatted.sort((s1, s2) => (s1.index > s2.index ? 1 : -1));
  const elements: JSX.Element[] = [];
  formatted.forEach((f) => {
    elements.push(
      <>
        <div className="py-2">
          <span>{f.index}. </span>
          <span>{f.value}</span>
        </div>
      </>
    );
  });
  return elements;
};

const Title = () => {
  return (
    <>
      <div className="py-10 text-center w-5/6 m-auto">
        <span className="font-semibold text-2xl sm:text-4xl">
          YouTube AI Title and Description generator
        </span>
      </div>
    </>
  )
}

const Description = () => {
  return (
    <>
      <div className="w-5/6 px-10 m-auto pb-6">
        <span className="text-xl font-semibold">To use:</span>
        <br />
        <br />
        <div className="text-lg">
          <span>
            <span className="font-semibold">1. </span>
            Enter your YouTube video script into the area below
          </span>
          <br />
          <span>
            <span className="font-semibold">2. </span>
            Click the generate button to generate 10 YouTube titles and 10
            Youtube descriptions
          </span>
          <br />
          <span>
            <span className="font-semibold">3. </span>
            That's it!
          </span>
        </div>
      </div>
    </>
  );
};

const getPrompt = (script: string, title: boolean) => {
  let prompt = "";
  if (title) {
    prompt =
      "The following is a generator for creating short titles with a lot of curiousity for videos based on scripts provided. Responds with 10 bullet points " +
      "labelled 1-10. Generate 10 titles for the following script. Script: " +
      script;
  } else {
    prompt =
      "Create a general summary of the following video script in less than 100 words. Script: " +
      script;
  }
  return prompt;
};

const generateTitles = async (script: string) => {
  const openai = getOpenAi();
  const titleRes = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: getPrompt(script, true),
    temperature: 1,
    max_tokens: 300,
  });
  if (titleRes.data.choices.length === 0) return undefined;
  const text = titleRes.data.choices[0].text?.trim() as string;
  const titles = [];
  for (let i = 1; i <= 10; i++) {
    let val =
      text.split(i + ".").length < 2
        ? undefined
        : text.split(i + ".")[1].split(i + 1 + ".").length === 0
        ? undefined
        : text.split(i + ".")[1].split(i + 1 + ".")[0];
    const split = val?.split('"');
    val = split === undefined ? val : split.length < 2 ? val : split[1];
    val = val?.split('"').length === 0 ? val : val?.split('"')[0];
    val = val?.trim();
    if (val !== undefined) titles.push(val);
  }
  return titles;
};

const generateDescription = async (script: string) => {
  const openai = getOpenAi();
  const descRes = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: getPrompt(script, false),
    temperature: 1,
    max_tokens: 100,
  });
  if (descRes.data.choices.length === 0) return undefined;
  return descRes.data.choices[0].text as string;
};

const getOpenAi = () => {
  const configuration = new Configuration({
    organization: process.env.NEXT_PUBLIC_OPEN_API_ORG,
    apiKey: process.env.NEXT_PUBLIC_OPEN_API_KEY,
  });
  return new OpenAIApi(configuration);
};

const generateScripts = async (
  script: string
): Promise<{
  titles: string[] | undefined;
  description: string | undefined;
}> => {
  const data = {
    titles: undefined,
    description: undefined,
  };
  if (
    process.env.NEXT_PUBLIC_OPEN_API_ORG === undefined ||
    process.env.NEXT_PUBLIC_OPEN_API_KEY === undefined
  )
    return data;
  const titles = await generateTitles(script);
  const description = await generateDescription(script);
  (data as any).titles = titles;
  (data as any).description = description;
  return data;
};

type EnterScriptProps = {
  setTitlesAndDescription: (
    titles: string[] | undefined,
    description: string | undefined
  ) => void;
  setLoading: (state: boolean) => void;
  textRef: MutableRefObject<null>;
};

const EnterScript = (props: EnterScriptProps) => {
  return (
    <>
      <form
        onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
        className="w-3/4 m-auto shadow-2xl pb-20"
      >
        <div className="py-4 w-full">
          <button
            onClick={async () => {
              const textValue =
                (props.textRef.current as any)?.value === undefined ||
                (props.textRef.current as any)?.value === ""
                  ? undefined
                  : (props.textRef.current as any).value;
              if (textValue === undefined) return;
              props.setLoading(true);
              const { titles, description } = await generateScripts(textValue);
              props.setLoading(false);
              props.setTitlesAndDescription(titles, description);
            }}
            className="bg-purple-700 px-4 py-2 rounded-xl font-semibold"
          >
            Generate
          </button>
        </div>
        <div
          style={{
            height: "40rem",
          }}
          className="break-words text-black text-center"
        >
          <textarea
            ref={props.textRef}
            className="resize-none px-6 py-4 break-words rounded-2xl flex-wrap w-full h-full"
            name="script"
            id="script"
            placeholder="Enter your YouTube video script here"
            required={true}
          />
        </div>
      </form>
    </>
  );
};

export default Home;
