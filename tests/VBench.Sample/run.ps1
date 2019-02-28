Param(
	[Alias('f')]
	[string]$Filter = "*RandomTest*",

	[Alias("p", "proj")]
	[string]$ProjectFile = $null,
	[switch]$Dry
)

Clear-Host;
if ([string]::IsNullOrEmpty($ProjectFile)) { $ProjectFile = Join-Path $PSScriptRoot "*.csproj" | Resolve-Path; }
else { $ProjectFile = $ProjectFile | Resolve-Path; }

&dotnet build $ProjectFile --configuration "Release" --verbosity minimal;
if ($LASTEXITCODE -ne 0) { throw "The build failed!"; }

try
{
	[string]$job = "Short";
	if ($Dry.IsPresent) { $job = "dry"; }

	[string]$ProjectFolder = Split-Path $ProjectFile -Parent;
	[string]$app = Join-Path $ProjectFolder "bin/Release/*/*$(Split-Path $ProjectFolder -Leaf).dll" | Resolve-Path;
	Split-Path $app -Parent | Push-Location;
	&dotnet $app --filter $Filter --memory --job $job;
}
finally { Pop-Location; }