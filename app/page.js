import Image from "next/image";

export default function Home() {
  return (
    <div>
    <div style={{ height: '40vh', width: '100%', position: 'relative' }}>
    <Image
      src="/Rectangle5.png" 
      alt="Background"
      layout="fill" 
      priority 
    />
    {/* Text Layer */}
    <div
        style={{
        
          position: 'absolute',
          top: '50%',
          left: '25%', 
          transform: 'translate(-50%, -50%)',
          color: '#484848',
          textAlign: 'center',
          zIndex: 2,
        }}
        className="hero-text"
      >
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>INTELLI-DATUM</h1>
        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Unlock The Potential Of Your Data</p>
      </div>
  </div>
  <div>
     
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ flex: 1, padding: '20px' }}>
          <div style={{ display: 'flex',flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
            <Image
              src="/DI.png"  
            
              alt="Logo 1"
              width={200}
              height={130}
              style={{ margin: '10px' }}
            />
            
          </div>
        </div>

        <div style={{ flex: 1, padding: '0px' }} className="about-section">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#484848' }}>About Us</h2>
          <p style={{ fontSize: '20px', color: '#484848' , lineHeight: '2' }}>
            Welcome to Intelli-Datum, where data chaos meets clarity. In collaboration with Data Insight Lab, we offer an AI-driven platform that effortlessly extracts and organizes data from any file type.
            Our mission is to simplify data management, enabling you to focus on the insights that matter most. Let us handle the complexity while you unlock your data’s potential.
          </p>
        </div>
      </div>
    </div>

    <div className="Home-categories">
        <h3 className='text-center' style={{ color: '#484848', fontSize:'2.5rem', fontWeight: 'bold'}}> Our Features</h3>
        <div className='row'  >
            <div className='features-container d-flex flex-wrap' style={{ padding:'2%' }}>          
                  <div className="card" style={{ backgroundColor:'#7BC28A', width: '18rem', marginLeft: '7rem', alignItems:'center', paddingTop:'10px', marginBottom:'40px' }}>
                  <Image
                    src="/home/home1.png"  
                    alt="Logo 1"
                    width={150}
                    height={150}
                   
                  />
                    <div className="card-body">
                      <h5 className="card-title ">Multi-Format File Handling</h5>
                      <h6 style={{ textAlign: 'justify'}}>Upload and process files in different formats</h6>
                    </div>
                  </div>

                  <div className="card" style={{ backgroundColor:'#7BC28A', width: '18rem', marginLeft: '7rem', alignItems:'center', paddingTop:'10px' , marginBottom:'40px' }}>
                  <Image
                    src="/home/home2.png"  
                    alt="Logo 1"
                    width={150}
                    height={150}
                   
                  />
                    <div className="card-body">
                      <h5 className="card-title ">Smart file detection</h5>
                      <h6 style={{ textAlign: 'justify'}}> Detect the type of file and structure, ensuring seamless handling of  single and multi-record files.</h6>

                    </div>
                  </div>

                  <div className="card" style={{ backgroundColor:'#7BC28A', width: '18rem', marginLeft: '7rem', alignItems:'center', paddingTop:'10px', marginBottom:'40px' }}>
                  <Image
                    src="/home/home3.png"  
                    alt="Logo 1"
                    width={150}
                    height={150}
                   
                  />
                    <div className="card-body">
                      <h5 className="card-title ">AI Pattern Recognition</h5>
                      <h6 style={{ textAlign: 'justify'}}> Identify headers, and recognize patterns to generate structured 
                      data effortlessly.</h6>

                    </div>
                  </div>

                  <div className="card" style={{ backgroundColor:'#7BC28A', width: '18rem', marginLeft: '7rem', alignItems:'center', paddingTop:'10px', marginBottom:'40px' }}>
                  <Image
                    src="/home/home4.png"  
                    alt="Logo 1"
                    width={150}
                    height={150}
                   
                  />
                    <div className="card-body">
                      <h5 className="card-title ">Schema Validation</h5>
                      <h6 style={{ textAlign: 'justify'}}> Ensure your files are properly formatted and identify any issues before moving forward</h6>                    
                    </div>
                  </div>


                  <div className="card" style={{ backgroundColor:'#7BC28A', width: '18rem', marginLeft: '7rem', alignItems:'center', paddingTop:'10px', marginBottom:'40px' }}>
                  <Image
                    src="/home/home5.png"  
                    alt="Logo 1"
                    width={150}
                    height={150}
                   
                  />
                    <div className="card-body">
                      <h5 className="card-title ">Data Organization</h5>
                      <h6 style={{ textAlign: 'justify'}}> Convert unstructured data into easy-to-manage structured dictionaries</h6>                    
                    </div>
                  </div>

                  <div className="card" style={{ backgroundColor:'#7BC28A', width: '18rem', marginLeft: '7rem', alignItems:'center', paddingTop:'10px', marginBottom:'40px' }}>
                  <Image
                    src="/home/home6.png"  
                    alt="Logo 1"
                    width={150}
                    height={150}
                   
                  />
                    <div className="card-body">
                      <h5 className="card-title ">Communication</h5>
                      <h6 style={{ textAlign: 'justify'}}>Using  dictionary to generate a message</h6>                    
                    </div>
                  </div>
            </div>
          </div>
      </div>
                
  </div>

  );
}