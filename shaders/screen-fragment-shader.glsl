uniform float uTime;
uniform vec3 uColor;
uniform sampler2D uScreen;
uniform float isFlickerOn;

in vec2 vUv;

// function that rounds the edges of the shape
float roundEdgeMask(vec2 coord, float radius) {

    // calculate vector from the centre to the pixel
    // coord is a vec2 so this is performing (coord.x, coord.y) - (0.5, 0.5)
    vec2 centreToCoordVec = coord - 0.5;

    // want to draw a circle to cut off square edges so it doesn't matter which direction the pixel is in from the centre
    vec2 absCentreToCoordVec = abs(centreToCoordVec);

    // each component has a value between 0.0 and 0.5 representing the distance from the centre
    // we shift everything by 0.5 so now if a component is:
    //      = 0.0:      the pixel is on the edge of the square
    //      < 0.0:      the pixel is inside the square
    vec2 signedDistanceFromOuterSquareEdge = absCentreToCoordVec - 0.5;

    // we now want to shrink the square by {radius} to make an inner square whose edges we can round
    // so after this step, if a component is:
    //      < 0.0:      the pixel is inside the inner square
    //      = 0.0:      the pixel is on the edge of the inner square
    //      > 0.0:      the pixel is outside of the inner square
    vec2 signedDistanceFromInnerSquareEdges = signedDistanceFromOuterSquareEdge + radius;

    // we only care about pixels outside of the inner square, as this is where the rounding will occur.
    // so we take the maximum of signedDistanceFromInnerSquareEdges and (0.0, 0.0) to clamp all negative components to 0.0.
    vec2 positiveDistances = max( signedDistanceFromInnerSquareEdges, 0.0 );

    // all components of positiveDistances have values between 0.00 and {radius}
    // if: 
    //      both components are 0.00:       the pixel is inside the inner square
    //      one component is 0.00:          the pixel is in line with one edge of the inner square but outside the other edge
    //      both components are >0.00:      the pixel is outside both edges of the inner square
    // so we want a way of only effecting the pixels in the last category
    // we calculate the length of the positiveDistances vector so we can then effect only: the pixels with distanceFromCorner > {radius} 
    float distanceFromCorner = length( positiveDistances );

    // now if distanceFromCorner is:
    //      < {radius} - 0.01 ( inside the inner square ):                                      alphaValue = 1
    //      between {radius} - 0.01 and {radius} ( on the curved edge of the inner square ):    alphaValue is interpolated between 0 and 1 based on distanceFromCorner
    //      > radius ( outside the curved edge of the inner square):                            alphaValue = 0
    float alphaValue = 1.0 - smoothstep( radius - 0.01, radius, distanceFromCorner );

    return alphaValue;

}

// main function
void main() {

    /////////////////////////////////
    ////////// ROUND EDGES //////////
    ///////////////////////////////// 

    // tuning variable
    float cornerRadius = 0.1;

    // calculate edge rounding
    float mask = roundEdgeMask( vUv, cornerRadius );



    /////////////////////////////////
    //////////// TEXTURE ////////////
    ///////////////////////////////// 

    // get texture color
    vec3 textureColor = texture2D( uScreen, vUv ).rgb;
    


    /////////////////////////////////
    /////////// SCANLINE ////////////
    ///////////////////////////////// 

    // note: for the following explaination, we index upwards 
    //        - e.g. every coord in band2 has larger y values than every coord in band1
    //
    // divide the whole area into scanlineCount number of chunks
    // divide each chunk into bandsInChunk number of bands
    // the scanline will take up the entirety of band0
    // divide band0 into 8 strips
    // we will color each strip as follows:
    //      strip0 = textureColor tinted blue
    //      strip1 = textureColor tinted green
    //      strip2 to strip5 = grey
    //      strip 6 = textureColor tinted green
    //      strip 7 = textureColor tinted red


    // tuning variables
    float scanlineCount = 25.0;
    float bandsInChunk = 2.0;
    float scanlineThickness = 3.0;
    float speed = -0.1;

    // calculation variables
    float bands = scanlineCount * bandsInChunk;
    float strips = bands * 8.0;


    // calculate vertical movement
    float y = vUv.y + uTime * speed;

    // calculate which band current coordinate is in
    float band = floor(y * bands);
    
    // calculate band index in chunk
    float bandIndex = mod(band, bandsInChunk);

    // strip colors
    vec3 scanline = vec3(0.0);
    vec3 redShift = vec3(0.8, 0.0, 0.0);
    vec3 greenShift = vec3(0.0, 0.8, 0.0);
    vec3 blueShift = vec3(0.0, 0.0, 0.8);
    vec3 centralBandColor = vec3(0.5, 0.5, 0.5);

    // draw scanline in band0
    if ( bandIndex == 0.0 ) {
        
        // calculate which strip current coordinate is in
        float strip = floor( y * strips );

        // calculate strip index in band
        float stripIndex = mod( strip, 8.0 );

        // apply color according to strip index
        if (stripIndex < 1.0) {
            scanline = textureColor + blueShift;
        }
        else if (stripIndex < 2.0) {
            scanline =  textureColor + greenShift;
        }
        else if (stripIndex < 6.0) {
            scanline = centralBandColor;
        }
        else if (stripIndex < 7.0) {
            scanline =  textureColor + greenShift;
        }
        else {
            scanline = textureColor + redShift;
        }
    }

    // this makes the scanline layer transparent everywhere that isnt a scanline
    else{
        scanline = vec3(1.0, 1.0, 1.0);
    }



    /////////////////////////////////
    /////////// VIGNETTE ////////////
    ///////////////////////////////// 

    // tuning variables
    float vignetteInner = 0.3;
    float vignetteOuter = 0.6;

    // calculate distance of pixel from centre ( vec2(0.5) = vec2(0.5,0.5) = centre coordinates)
    float dist = distance( vec2( 0.5 ), vUv );

    // smoothstep( a, b, x ) performs a hermite interpolation between a and b at the value x
    // so if the distance of the pixel from the centre is:
    //      smaller than vignetteInner, smoothstep returns 0
    //      greater than vignetteOuter, smoothstep returns 1
    //      between the two, smoothstep returns a value between 0 and 1 calculated by a hermite interpolation
    // subtract from 1 because multiplying our color value by 0 makes the pixel black, and by 1 doesn't alter it,
    // so we want to flip our values.
    float vignette = 1.0 - smoothstep( vignetteInner, vignetteOuter, dist );



    /////////////////////////////////
    //////////// FLICKER ////////////
    ///////////////////////////////// 

    // tuning variables
    float flickerMax = 0.8;
    float flickerMin = 0.4;
    float flickerRate = 110.0;

    // calculation variables
    float sineWaveCentre = 0.5 * ( flickerMax + flickerMin );
    float sineWaveAmplitude = 0.5 * ( flickerMax - flickerMin );

    // flicker calculation
    float flicker = (sineWaveAmplitude * isFlickerOn * sin(uTime * flickerRate)) + sineWaveCentre;



    /////////////////////////////////
    ////////// FINAL COLOR //////////
    ///////////////////////////////// 

    // calculate pixel color using texture, scanline, vignette, flicker
    vec3 color = textureColor * uColor * scanline * vignette * flicker;  



    /////////////////////////////////
    ///////// gl_FragColor //////////
    ///////////////////////////////// 

    gl_FragColor = vec4(color, mask);
}
