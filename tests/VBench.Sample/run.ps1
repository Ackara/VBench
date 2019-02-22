Param([string]$Filter = "*RandomTest*")

Clear-Host;
[string]$projectFile = Join-Path $PSScriptRoot "*.csproj" | Resolve-Path;
&dotnet build $projectFile --configuration "Release" --verbosity minimal;
if ($LASTEXITCODE -ne 0) { throw "The build failed!"; }

try
{
	[string]$app = Join-Path $PSScriptRoot "bin/Release/*/*Sample.dll" | Resolve-Path;
	Split-Path $app -Parent | Push-Location;
	&dotnet $app --filter $Filter;

	Join-Path $PWD "BenchmarkDotNet.Artifacts/results/*.vbench.html" | Resolve-Path;
}
finally { Pop-Location; }