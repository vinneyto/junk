layout (std140) uniform UBOData {
  float UBORed;
  float UBOGreen;
  float UBOBlue;
};

out vec4 outColor;

void main() {
  outColor = vec4(UBORed, UBOGreen, UBOBlue, 1.0);
}
