#version 420

uniform sampler2D uNormalMap;
uniform sampler2D uDepthMap;
uniform vec2 uPixelSize; //x = 1 / WINDOW_WIDTH, y = 1 / WINDOW_HEIGHT

in vec2 texcoord;

out float outEdge;

float Sobel_Normal_Horizontal(sampler2D texmap, vec2 texcoord)
{
	vec3 sum = vec3(0.0);

	//Is this affected by the change from row-major to column-major?***
	//Left Column
	sum -= texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y + uPixelSize.y)).rgb;
	sum -= texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y)).rgb * 2.0;
	sum -= texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y - uPixelSize.y)).rgb;

	//Right Column
	sum += texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y + uPixelSize.y)).rgb;
	sum += texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y)).rgb * 2.0;
	sum += texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y - uPixelSize.y)).rgb;
	//The sum should be (0,0,0) if there is no contrast ^
	
	//x * x + y * y, z * z = length(sum)^2
	float edgeFactor = dot(sum, sum);
	
	if (edgeFactor < 0.7) //Number depends on the scale of the scene
	{
		return 1.0;
	}
	else
	{
		return 0.0;
	}
}

float Sobel_Normal_Vertical(sampler2D texmap, vec2 texcoord)
{
	vec3 sum = vec3(0.0);

	//Is this affected by the change from row-major to column-major?***
	//Left Column
	sum += texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y + uPixelSize.y)).rgb;
	sum += texture(texmap, vec2(texcoord.x, texcoord.y + uPixelSize.y)).rgb * 2.0;
	sum += texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y + uPixelSize.y)).rgb;

	//Right Column
	sum -= texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y - uPixelSize.y)).rgb;
	sum -= texture(texmap, vec2(texcoord.x, texcoord.y - uPixelSize.y)).rgb * 2.0;
	sum -= texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y - uPixelSize.y)).rgb;
	//The sum should be (0,0,0) if there is no contrast ^
	
	//x * x + y * y, z * z = length(sum)^2
	float edgeFactor = dot(sum, sum);
	
	if (edgeFactor < 0.7) //Number depends on the scale of the scene
	{
		return 1.0;
	}
	else
	{
		return 0.0;
	}
}

float Sobel_Depth_Horizontal(sampler2D texmap, vec2 texcoord)
{
	float sum = 0.0;

	//Is this affected by the change from row-major to column-major?***
	//Top Row
	sum -= texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y + uPixelSize.y)).r;
	sum -= texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y)).r * 2.0;
	sum -= texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y - uPixelSize.y)).r;

	//Bottom Row
	sum += texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y + uPixelSize.y)).r;
	sum += texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y)).r * 2.0;
	sum += texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y - uPixelSize.y)).r;
	//The sum should be 0 if there is no contrast ^
	
	if (sum < 0.05) //THreshold number depends on the scale of the scene
	{
		return 1.0;
	}
	else
	{
		return 0.0;
	}
}

float Sobel_Depth_Vertical(sampler2D texmap, vec2 texcoord)
{
	float sum = 0.0;

	//Is this affected by the change from row-major to column-major?***
	//Top Row
	sum += texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y + uPixelSize.y)).r;
	sum += texture(texmap, vec2(texcoord.x, texcoord.y + uPixelSize.y)).r * 2.0;
	sum += texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y + uPixelSize.y)).r;

	//Bottom Row
	sum -= texture(texmap, vec2(texcoord.x - uPixelSize.x, texcoord.y - uPixelSize.y)).r;
	sum -= texture(texmap, vec2(texcoord.x, texcoord.y - uPixelSize.y)).r * 2.0;
	sum -= texture(texmap, vec2(texcoord.x + uPixelSize.x, texcoord.y - uPixelSize.y)).r;
	//The sum should be 0 if there is no contrast ^
	
	if (sum < 0.05) //Number depends on the scale of the scene
	{
		return 1.0;
	}
	else
	{
		return 0.0;
	}
}

void main()
{
	//If at least one of the functions return 0 then the whole thing will be 0 and there will be an edge
	float depthSobel = Sobel_Depth_Horizontal(uDepthMap, texcoord) * Sobel_Depth_Vertical(uDepthMap, texcoord);
	float normalSobel = Sobel_Normal_Horizontal(uNormalMap, texcoord) * Sobel_Normal_Vertical(uNormalMap, texcoord);

	outEdge = depthSobel * normalSobel;
}