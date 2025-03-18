"use client"
import React from 'react'
import { useState } from 'react';


const page = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileDetails, setFileDetails] = useState(null);
  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the first selected file
    setSelectedFile(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFile) {
      setFileDetails({
        name: selectedFile.name,
        size: `${(selectedFile.size / 1024).toFixed(2)} KB`, // Convert size to KB
        status: 'Processing...',
      });
    }
  };

  return (
    <div style={{display:'flex', flexDirection: 'column',alignItems: 'center',}}>
        <div
        style={{backgroundColor:'#C0D7BA', marginTop:'5%', width:'80%',
             height:'50px',
              padding:'10px',
               borderRadius:'10px'}}
        >
            <h3 style={{color:'#484848'}}>
                Upload File
            </h3>
        </div>

        <div
        style={{backgroundColor:'#fff',width:'80%',
            height:'100%', border:'1px', border: '2px solid #000',
            marginTop:'20px', borderRadius:'10px' }}
        >
            <div style={{ padding: '20px' ,display:'flex', flexDirection: 'column'}}>
                
                <form onSubmit={handleSubmit}>
                    <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ marginBottom: '10px' }}
                    />
                    <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor:'#C0D7BA', borderRadius:'10px' }}>
                    Submit
                    </button>
                </form>
                {selectedFile && (
                    <div style={{ marginTop: '10px' }}>
                    <strong>Selected File:</strong> {selectedFile.name}
                    </div>
                )}
            </div>
        </div>
        

        <div
        style={{backgroundColor:'#fff',width:'80%',
            height:'100%', border:'1px', border: '2px solid #000',
            marginTop:'5px', borderRadius:'10px', marginBottom:'20%' }}
        >
            <div style={{ padding: '20px' ,display:'flex', flexDirection: 'column'}}>
            <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              <div style={{ width: '40%' }}>Filename</div>
              <div style={{ width: '30%' }}>File Size</div>
              <div style={{ width: '30%' }}>Status</div>
            </div>
            {fileDetails && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ width: '40%' }}>{fileDetails.name}</div>
                <div style={{ width: '30%' }}>{fileDetails.size}</div>
                <div style={{ width: '30%' }}>{fileDetails.status}</div>
              </div>
            )}
          </div>
                
            </div>
        </div>

    </div>
    
  )
}

export default page