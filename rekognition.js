let AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

const Rekognition = new AWS.Rekognition();

exports.getLabelsMessage = async () => {
  const result = await Rekognition.detectLabels({
    Image: {
      S3Object: {
        Bucket: "vision-hack-1011",
        Name: "image.png"
      },
    }
}).promise();

  let resultLabelSet = new Set();

  result.Labels.forEach((label)=>{
      label.Instances.forEach((instance)=>{
        if(!(instance.BoundingBox === undefined || instance.BoundingBox === null)) {
          resultLabelSet.add(label.Name);
        }
      })
  })

  console.log(resultLabelSet);
  let speakOut = 'I can find a '; 
  if(resultLabelSet.size === 0){
    return `I cannot find anything in front of you.`
  }
  else if(resultLabelSet.size === 1){
    resultLabelSet.forEach((itemName) => {
      speakOut = speakOut.concat(`${itemName} `);
    })
  }
  else {
    resultLabelSet.forEach((itemName) => {
      speakOut = speakOut.concat(`${itemName}, `);
    })
  }

  speakOut = speakOut.concat('in front of you');
  console.log(speakOut);
  return speakOut;
};


exports.isLabelPresent = async (itemName) => {
  const result = await Rekognition.detectLabels({
    Image: {
      S3Object: {
        Bucket: "vision-hack-1011",
        Name: "image.png"
      },
    }
}).promise();

  let itemFound = false;
  result.Labels.forEach((label)=>{
    itemFound = itemFound || label.Name.toLocaleLowerCase() === itemName 
    const nameParts = label.Name.toLocaleLowerCase().split(' ');
    nameParts.forEach((part)=>{
      itemFound = itemFound || part === itemName;
    })
  })

  if(itemFound) {
      return `Yeah, I can find a ${itemName}.`;
  }
  return `No, I cannot find a ${itemName}.`;
};

exports.getText = async () => {
  const result = await Rekognition.detectText({
    Image: {
      S3Object: {
        Bucket: "vision-hack-1011",
        Name: "image.png"
      },
    }
}).promise();

  let text = '';

  result.TextDetections.forEach((detection) => {
    if(detection.Confidence > 80) {
      text = text.concat(detection.DetectedText).concat(' ');
    }
  })

  if(text === ''){
    return 'Sorry, I am unable to detect any text.'
  }

  return `Here is the text I was able to recognize. ${text}`; 
};