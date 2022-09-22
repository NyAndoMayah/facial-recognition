import { DetectFacesResponse, FaceDetailList } from "aws-sdk/clients/rekognition";
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faExpand, faMinus } from '@fortawesome/free-solid-svg-icons'
import { isTypeElement } from "typescript";
import { AnyARecord } from "dns";
//import { URL } from "url";
var AWS = require("aws-sdk");
export function Input() {
  const [table, setTable] = useState<FaceDetailList>();
  const [image, setImage] = useState<string>();
  function AnonLog() {

    // Configure the credentials provider to use your identity pool
    AWS.config.region = 'eu-west-2'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'eu-west-2:371cdf1c-657e-4e3f-a6a0-3cdcf905bfdc',
    });
    // Make the call to obtain credentials
    AWS.config.credentials.get(function () {
      // Credentials will be available when this function is called.
      var accessKeyId = AWS.config.credentials.accessKeyId;
      var secretAccessKey = AWS.config.credentials.secretAccessKey;
      var sessionToken = AWS.config.credentials.sessionToken;
    });
  }
  function DetectFaces(imageData: Blob) {
    AWS.region = "eu-west-2";
    var rekognition = new AWS.Rekognition();
    var params = {
      Image: {
        Bytes: imageData
      },
      Attributes: [
        'ALL',
      ]
    };
    rekognition.detectFaces(params, function (err: Error, data: DetectFacesResponse) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        setTable(data.FaceDetails);
        console.log(data.FaceDetails)
      }
    });
  }
  const ProcessImage = (event: any) => {
    setImage(URL.createObjectURL(event.target.files[0]));
    AnonLog();

    var reader = new FileReader();
    reader.onload = (function (theFile) {
      return function (e: any) {
        var image: any = null;
        var jpg = true;
        try {
          image = atob(e.target.result.split("data:image/jpeg;base64,")[1]);

        } catch (e) {
          jpg = false;
        }
        if (jpg == false) {
          try {
            image = atob(e.target.result.split("data:image/png;base64,")[1]);
          } catch (e) {
            alert("Not an image file Rekognition can process");
            return;
          }
        }

        var length = image.length;
        var imageBytes: any = new ArrayBuffer(length);
        var ua = new Uint8Array(imageBytes);
        for (var i = 0; i < length; i++) {
          ua[i] = image.charCodeAt(i);
        }
        DetectFaces(imageBytes);
      };
    })(event.target.files[0]);
    reader.readAsDataURL(event.target.files[0]);
  }
  return (

  <>
    <div id="header">
      <h1> <FontAwesomeIcon icon={faExpand} />    Facial recognition</h1>
      <div className="mb-3">
        <input className="form-control" type="file" id="formFile" onChange={ProcessImage} />
      </div>
    </div>
    <div id="container">
      <div id="placeForImage">
        <div id="imageContainer">
          <img src={image} id="imageResponse" />
        </div>
      </div>
      <div id="textcontainer">
        {
          table?.map((item, index) => {
            const entries = Object.entries(item);
            return <div className="card" id="text">
              <div id="carouselExampleIndicators" className="carousel slide theCarousel" data-bs-interval="false">
                <div id="carousel-indicators">
                  <ol className="carousel-indicators">
                    <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active"><FontAwesomeIcon icon={faMinus} /></li>
                    <li data-target="#carouselExampleIndicators" data-slide-to="1"><FontAwesomeIcon icon={faMinus} /></li>
                    <li data-target="#carouselExampleIndicators" data-slide-to="2"><FontAwesomeIcon icon={faMinus} /></li>
                  </ol>
                </div>

                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <div className="card-header headerDiv" id="resultDiv "><h6>AgeRange</h6><p></p></div>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item liItem">Low: {item?.AgeRange?.Low}</li>
                      <li className="list-group-item liItem">High: {item?.AgeRange?.High}</li>
                    </ul>
                    {entries.map((item, i) => {
                      if (i >= 2 && i <= 5) {
                        return <>
                          <div className="card-header headerDiv " id="resultDiv"><h6>{item[0].toString()}</h6></div>
                          <ul className="list-group list-group-flush ">
                            <li className="list-group-item liItem">Value : {JSON.stringify(item[1]).substring(
                              JSON.stringify(item[1]).indexOf(":") + 1,
                              JSON.stringify(item[1]).lastIndexOf(",")
                            )}</li>
                            <li className="list-group-item liItem">Confidence :{Number.parseFloat(item[1].Confidence).toFixed(2)} %</li>
                          </ul>
                        </>
                      }
                      else return null;
                    })}
                  </div>
                  <div className="carousel-item">
                    <div className="card-header headerDiv" id="resultDiv"><h6>Emotions</h6></div>
                    <div id="textoverflowed">
                      {entries[10].map((item, i) => {
                        if (i == 1) {
                          return <>
                            <ul className="list-group list-group-flush listItem" >
                              {item.map((child: { Type: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; Confidence: string; }) => <li className="list-group-item " ><p>Type : {child.Type}</p><p>Confidence : {Number.parseFloat(child.Confidence).toFixed(2)} %</p></li>
                              )}
                            </ul>
                          </>
                        }
                      })}</div>
                  </div>
                  <div className="carousel-item">
                    <div className="card-header headerDiv" id="resultDiv"><h6>Pose</h6></div>
                    <>
                      {entries[12].map((item, i) => {
                        if (i == 1) {
                          return <>
                            <ul className="list-group list-group-flush listItem" >
                              <li className="list-group-item liItem">Roll: {Number.parseFloat(item.Roll).toFixed(2)} %</li>
                              <li className="list-group-item liItem">Yaw: {Number.parseFloat(item.Yaw).toFixed(2)} %</li>
                              <li className="list-group-item liItem">Roll: {Number.parseFloat(item.Pitch).toFixed(2)} %</li>
                            </ul>
                          </>
                        }
                      })}</>
                    <div className="card-header headerDiv" id="resultDiv"><h6>Quality</h6></div>
                    <>
                      {entries[13].map((item, i) => {
                        if (i == 1) {
                          return <>
                            <ul className="list-group list-group-flush listItem" >
                              <li className="list-group-item liItem">Roll: {Number.parseFloat(item.Brightness).toFixed(2)} %</li>
                              <li className="list-group-item liItem">Yaw: {Number.parseFloat(item.Sharpness).toFixed(2)} %</li>
                            </ul>
                          </>
                        }
                      })}</>
                    <div className="card-header headerDiv" id="resultDiv"><h6>Confidence:    {entries[14][1]}</h6></div>


                  </div>
                </div>

              </div>
            </div>
          })}
      </div>
      <div id="showMore">
        <p>
          <a className="btn btn button" data-bs-toggle="collapse" href="#multiCollapseExample1" role="button" aria-expanded="false" aria-controls="multiCollapseExample1">Show more informations</a>
        </p>
        <div className="row">
          <div className="col">
            <div className="collapse multi-collapse" id="multiCollapseExample1">
              <div className="card-header details" id="resultDiv" ><h6>Details</h6></div>
              {table?.map((item, index) => {
                const entries = Object.entries(item);
                return <>
                  {entries[11].map((item, i) => {
                    if (i == 1) {
                      return <>
                        <ul className="list-group list-group-flush listItem ">
                          {item.map((child: { Type: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; X: string; Y: string; }) => <li className="list-group-item" ><p>Type : {child.Type}</p><p>X : {Number.parseFloat(child.X).toFixed(2)} %</p><p>Y : {Number.parseFloat(child.Y).toFixed(2)} %</p></li>
                          )}
                        </ul>
                      </>
                    }
                  })}
                </>
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

  </>
  );
}