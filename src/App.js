import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css"; // Import the CSS file

function App() {
  const [text, setText] = useState("");
  const [resultText, setResultText] = useState("");
  const [synonyms, setSynonyms] = useState([]);
  const [selectedWord, setSelectedWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setText(e.target.value);
    setResultText("");
    setSynonyms([]);
    setSelectedWord("");
  };

  const clearInput = () => {
    setText("");
    setResultText("");
    setSynonyms([]);
    setSelectedWord("");
  };

  const paraphraseText = async () => {
    setIsLoading(true);
    try {
      const words = text.split(" ");
      let paraphrasedArray = await Promise.all(
        words.map(async (word) => {
          const response = await axios.get("https://api.datamuse.com/words", {
            params: {
              ml: word, // ml stands for "means like"
            },
          });
          if (response.data.length > 0) {
            return response.data[0].word; // Replace with the first related word
          } else {
            return word; // If no related word found, keep the original word
          }
        })
      );
      setResultText(paraphrasedArray.join(" "));
    } catch (error) {
      console.error("Error paraphrasing text:", error);
      toast.error("Error paraphrasing text.");
    }
    setIsLoading(false);
  };

  const checkSpelling = async () => {
    setIsLoading(true);
    try {
      const words = text.split(" ");
      let correctedArray = await Promise.all(
        words.map(async (word) => {
          const response = await axios.get("https://api.datamuse.com/words", {
            params: {
              sp: word, // sp stands for "spelled like"
            },
          });
          if (
            response.data.length > 0 &&
            response.data[0].word.toLowerCase() === word.toLowerCase()
          ) {
            return `<span style="color: green;">${word}</span>`; // Correct spelling
          } else if (response.data.length > 0) {
            return `<span style="color: red;">${word}</span> (Did you mean: <span style="color: blue;">${response.data[0].word}</span>?)`; // Incorrect spelling with suggestion
          } else {
            return `<span style="color: red;">${word}</span> (No suggestions available)`; // Incorrect spelling with no suggestion
          }
        })
      );
      setResultText(correctedArray.join(" "));
    } catch (error) {
      console.error("Error checking spelling:", error);
      toast.error("Error checking spelling.");
    }
    setIsLoading(false);
  };

  const handleTextSelection = () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText.split(" ").length === 1) {
      setSelectedWord(selectedText);
      suggestSynonyms(selectedText);
    } else {
      setSelectedWord("");
      setSynonyms([]);
    }
  };

  const suggestSynonyms = async (word) => {
    try {
      const response = await axios.get("https://api.datamuse.com/words", {
        params: {
          rel_syn: word, // rel_syn stands for "related to synonyms"
        },
      });

      setSynonyms(response.data.map((suggestion) => suggestion.word));
    } catch (error) {
      console.error("Error fetching synonyms:", error);
      toast.error("Error fetching synonyms.");
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <h1 className="header">Text Enhancer</h1>
      <div className="textAreaContainer" onMouseUp={handleTextSelection}>
        <textarea
          value={text}
          onChange={handleInputChange}
          placeholder="Type or paste your text here..."
          className="textArea"
        />
        {text && (
          <button onClick={clearInput} className="clearButton">
            &times;
          </button>
        )}
      </div>
      <div className="buttonContainer">
        <button
          onClick={paraphraseText}
          className="button"
          disabled={isLoading}
        >
          {isLoading ? "Paraphrasing..." : "Paraphrase Text"}
        </button>
        <button onClick={checkSpelling} className="button" disabled={isLoading}>
          {isLoading ? "Checking Spelling..." : "Check Spelling"}
        </button>
      </div>

      {resultText && (
        <div className="resultContainer">
          <h2 className="subHeader">Result:</h2>
          <p
            className="resultText"
            dangerouslySetInnerHTML={{ __html: resultText }}
          />
        </div>
      )}

      <div className="resultContainer">
        <h2 className="subHeader">
          Word Count: {text.split(" ").filter((word) => word).length} |
          Character Count: {text.length}
        </h2>
      </div>

      {selectedWord && (
        <div className="synonymsContainer">
          <h2 className="subHeader">Synonyms for "{selectedWord}":</h2>
          <ul className="synonymsList">
            {synonyms.length > 0 ? (
              synonyms.map((synonym, index) => (
                <li key={index} className="synonymItem">
                  {synonym}
                </li>
              ))
            ) : (
              <li className="synonymItem">No synonyms found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
