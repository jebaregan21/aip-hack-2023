const Alexa = require('ask-sdk-core');
const rekognition = require('./rekognition.js');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to alexa vision.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Welcome to alexa vision.', speechText)
      .getResponse();
  }
};

const DescribeCaptureIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DescribeCaptureIntent';
    },
    async handle(handlerInput) {
        const speakOut = await rekognition.getLabelsMessage();
      
        return handlerInput.responseBuilder
            .speak(speakOut)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const AssertionObjectIntentHanlder = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AssertionObjectIntent';
},
async handle(handlerInput) {
    const item = Alexa.getSlotValueV2(handlerInput.requestEnvelope, 'item');
    console.log(item);
    const speakOut = await rekognition.isLabelPresent(item.value);
  
    return handlerInput.responseBuilder
        .speak(speakOut)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse();
}
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'I can identify the objects in front of you. How can I help you.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('I can identify the objects in front of you. How can I help you.', speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Goodbye!', speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    // Any clean-up logic goes here.
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    return handlerInput.responseBuilder
      .speak('Sorry, I don\'t understand your command. Please say it again.')
      .reprompt('Sorry, I don\'t understand your command. Please say it again.')
      .getResponse();
  }
};

let skill;

exports.handler = async function (event, context) {
  console.log(`REQUEST++++${JSON.stringify(event)}`);

  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        DescribeCaptureIntentHandler,
        AssertionObjectIntentHanlder,
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`RESPONSE++++${JSON.stringify(response)}`);

  return response;
};