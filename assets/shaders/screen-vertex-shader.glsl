uniform float shapeWidth;
uniform float shapeHeight;

out vec2 vUv;

// main function
void main() {

    // uv variable to send to fragment shader
    vUv = uv;

    // vertex position
    vec3 pos = position;

    // normalize screen space based on shape size
    float x = pos.x / ( shapeWidth * 0.5 ); 
    float y = pos.y / ( shapeHeight * 0.5 ); 

    // tuning variables
    float radius = sqrt(x * x + y * y);
    float curvature = 20.0;

    // calculate curvature
    pos.z += radius * radius * curvature;

    // gl_Position calculation
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
