"use client"
import React from 'react'
import { useState } from 'react';


const UserDetails = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileDetails, setFileDetails] = useState(null);
    //const [FirstName,setFirstName] = useState('')
    //const [LastName, setLastName] = useState('')
    //const [email, setEmail] = useState('')
 /* const handleFileChange = (event) => {
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
  };*/

  return (
    <div style={{display:'flex', flexDirection: 'column',alignItems: 'center',}}>
        <div
        style={{backgroundColor:'#C0D7BA', marginTop:'5%', width:'80%',
             height:'50px',
              padding:'10px',
               borderRadius:'10px'}}
        >
            <h3 style={{color:'#484848'}}>
                User Details
            </h3>
        </div>
            
        <div class = "row"
        style={{backgroundColor:'#fff',width:'80%',
            height:'100%', border:'1px', border: '2px solid #000',
            marginTop:'20px', borderRadius:'10px' }}
        >
            <div class='col-3'>
                <img src='User.png' style={{height:'200px', width:'200px'}} className="card-img-top" alt="..." />
            </div>      

            <div class = 'col-9'style={{ padding: '20px' ,display:'flex', flexDirection: 'column'}}>
                <div class = 'row mb-5' >
                    FirstName : Sarah 
                </div>
                <div class = 'row mb-5'>
                    LastName : Ali
                </div>
                <div class = 'row '>
                    Email : saraAli@nu.edu.pk 
                </div>
                
            </div>
        </div>
        
        <div
        style={{backgroundColor:'#C0D7BA', marginTop:'5%', width:'80%',
             height:'50px',
              padding:'10px',
               borderRadius:'10px'}}
        >
            <h3 style={{color:'#484848'}}>
                User Files
            </h3>
        </div>
        <div
        style={{backgroundColor:'#fff',width:'80%',
            height:'100%', border:'1px', border: '2px solid #000',
            marginTop:'20px', borderRadius:'10px', marginBottom:'20%' }}
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

export default UserDetails