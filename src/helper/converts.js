import { isEqual } from "lodash";
import {generateUniqueKey} from './generateUniqueKey';

const RequestTypes = ["post", "put", "patch"];

export function addOrUpdateResponse(oldMockResponses, unstructuredData) {
  const mockResponses = [...oldMockResponses];
  const url = unstructuredData.url;
  const method = unstructuredData.method;
  const status = unstructuredData.status;
  const body = unstructuredData.response;

  let existingRequest = null;

  if (RequestTypes.includes(method))
    existingRequest = mockResponses.find((request) => {
      return (
        request.url === url &&
        request.method === method &&
        isEqual(request.request, unstructuredData.config.request)
      );
    });

  existingRequest = mockResponses.find((request) => {
    return request.url === url && request.method === method;
  });

  if (existingRequest) {
    // Check if the response variation already exists for the existing request
    const existingResponse = existingRequest.responseVariations.find(
      (variation) => {
        return variation.status === status && isEqual(variation.body, body);
      }
    );
    if (existingResponse) {
      console.log(
        "Response variation already exists for the given URL and method"
      );
      return {};
    } else {
      const newResponse = {
        id: existingRequest.responseVariations.length + 1,
        status: status,
        body,
      };
      existingRequest.responseVariations.unshift(newResponse);
      console.log("New response variation added to the existing request");
      return { response: existingRequest, method: "put" };
    }
  } else {
    // Create a new request with a response variation
    const newRequest = {
      id: generateUniqueKey(),
      url: url,
      method: method,
      variant: 0,
      __mock_status__:true,
      responseVariations: [
        {
          id: 1,
          status: status,
          body,
        },
      ],
    };
    if (RequestTypes.includes(method))
      newRequest.request = unstructuredData.config.request;

    mockResponses.unshift(newRequest);
    console.log("New request with response variation added");
    return { response: newRequest, method: "add",mockResponses };
  }
}
