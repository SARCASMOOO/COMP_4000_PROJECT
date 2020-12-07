/**
 * @constructor
 * @implements {UnaryInterceptor}
 */
const SimpleUnaryInterceptor = function() {};

/** @override */
SimpleUnaryInterceptor.prototype.intercept = function(request, invoker) {
    // Update the request message before the RPC.
    const reqMsg = request.getRequestMessage();
    reqMsg.setMessage('[Intercept request]' + reqMsg.getMessage());

    // After the RPC returns successfully, update the response.
    return invoker(request).then((response) => {
        // You can also do something with response metadata here.
        console.log(response.getMetadata());

        // Update the response message.
        const responseMsg = response.getResponseMessage();
        responseMsg.setMessage('[Intercept response]' + responseMsg.getMessage());

        return response;
    });
};

module.exports = {
    SimpleUnaryInterceptor: new SimpleUnaryInterceptor
}