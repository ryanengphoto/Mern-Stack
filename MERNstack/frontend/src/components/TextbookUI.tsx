import React, { useState, useEffect } from "react";
import { textbookService, Textbook, CreateTextbookData } from "../lib/textbook-service";

function TextbookUI() {
  const _ud: any = localStorage.getItem("user_data");
  const ud = JSON.parse(_ud || "{}");
  const userId: string = ud.id;

  const [message, setMessage] = useState("");
  const [searchResults, setSearchResults] = useState<Textbook[]>([]);
  const [textbookList, setTextbookList] = useState<Textbook[]>([]);
  const [search, setSearchValue] = useState("");
  const [textbookTitle, setTextbookTitle] = useState("");
  const [textbookPrice, setTextbookPrice] = useState<number>(0);
  const [textbookCondition, setTextbookCondition] = useState<
    "new" | "like new" | "used" | "very used"
  >("used");

  useEffect(() => {
    fetchUnsoldTextbooks();
  }, []);

  const fetchUnsoldTextbooks = async () => {
    try {
      const books = await textbookService.getAllTextbooks();
      // filter for unsold textbooks
      const unsold = books.filter((b) => !b.buyer);
      setTextbookList(unsold);
    } catch (err: any) {
      setMessage(err.toString());
    }
  };

    //add textbook
    async function addTextbook(e:any) : Promise<void>
    {
        e.preventDefault();
        let obj = {userId:userId,textbook:textbook};
        let js = JSON.stringify(obj);
        try
        {
            const response = await fetch('https://lamp-stack4331.xyz/api/addtextbook',
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            
            if( res.error.length > 0 )
            {
                setMessage( "API Error:" + res.error );
            }
            else
            {
                setMessage('Textbook has been added');
            }
        }
        catch(error:any)
        {
            setMessage(error.toString());
        }
    };

    //search textbook
    async function searchTextbook(e:any) : Promise<void>
    {
        e.preventDefault();
        let obj = {userId:userId,search:search};
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch('https://lamp-stack4331.xyz/api/searchtextbooks',
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            let _results = res.results;
            let resultText = '';

            for( let i=0; i<_results.length; i++ )
            {
                resultText += _results[i];
                if( i < _results.length - 1 )
                {
                    resultText += ', ';
                }
            }
            
            setResults('Textbook(s) have been retrieved');
            setTextbookList(resultText);
        }
        catch(error:any)
        {
            alert(error.toString());
            setResults(error.toString());
        }
    };

    try {
      await textbookService.addTextbook(newTextbook);
      setMessage("Textbook has been added");
      setTextbookTitle("");
      setTextbookPrice(0);
      setTextbookCondition("used");
      fetchUnsoldTextbooks(); // refresh list
    } catch (err: any) {
      setMessage(err.toString());
    }
  };

  const searchTextbook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const results = await textbookService.searchTextbooks(search);
      // show only unsold results
      setSearchResults(results.filter((b) => !b.buyer));
    } catch (err: any) {
      setMessage(err.toString());
    }
  };

  const renderTextbook = (t: Textbook) => (
    <li key={t._id}>
      {t.title} {t.price ? `- $${t.price}` : ""} ({t.condition})
    </li>
  );

  return (
    <div id="textbookUIDiv">
      <h2>Search Textbooks</h2>
      <input
        type="text"
        placeholder="Textbook To Search For"
        value={search}
        onChange={handleSearchTextChange}
      />
      <button onClick={searchTextbook}>Search</button>
      <ul>
        {searchResults.length > 0
          ? searchResults.map(renderTextbook)
          : search && <li>No results found</li>}
      </ul>

      <h2>Add Textbook</h2>
      <input
        type="text"
        placeholder="Textbook To Add"
        value={textbookTitle}
        onChange={handleTextbookTextChange}
      />
      <input
        type="number"
        placeholder="Price"
        value={textbookPrice}
        onChange={handlePriceChange}
      />
      <select value={textbookCondition} onChange={handleConditionChange}>
        <option value="new">New</option>
        <option value="like new">Like New</option>
        <option value="used">Used</option>
        <option value="very used">Very Used</option>
      </select>
      <button onClick={addTextbook}>Add Textbook</button>
      {message && <p>{message}</p>}

      <h2>All Unsold Textbooks</h2>
      <ul>
        {textbookList.length > 0
          ? textbookList.map(renderTextbook)
          : <li>No textbooks available</li>}
      </ul>
    </div>
  );
}

export default TextbookUI;
