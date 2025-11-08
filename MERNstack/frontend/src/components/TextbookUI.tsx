import React, { useState } from 'react';

function TextbookUI()
{
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;
    let firstName : string = ud.firstName;
    let lastName : string = ud.lastName;

    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [textbookList,setTextbookList] = useState('');
    const [search,setSearchValue] = React.useState('');
    const [textbook,setTextbookNameValue] = React.useState('');
    
    function handleSearchTextChange( e: any ) : void
    {
        setSearchValue( e.target.value );
    }

    function handleTextbookTextChange( e: any ) : void
    {
        setTextbookNameValue( e.target.value );
    }

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
                setMessage( "API Error: " + res.error );
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

    return (
        <div id="textbookUIDiv">
            <br />
            Search: <input type="text" id="searchText" placeholder="Textbook To Search For" onChange={handleSearchTextChange}/>
            <button type="button" id="searchTextbookButton" className="buttons" onClick={searchTextbook}> Search Textbook</button><br/>
            <span id="textbookSearchResult">{searchResults}</span>
            <p id="textbookList">{textbookList}</p><br /><br />
            Add: <input type="text" id="textbookText" placeholder="Textbook To Add" onChange={handleTextbookTextChange} />
            <button type="button" id="addTextbookButton" className="buttons" onClick={addTextbook}> Add Textbook </button><br />
            <span id="textbookAddResult">{message}</span>
        </div>
    );
}

export default TextbookUI;
