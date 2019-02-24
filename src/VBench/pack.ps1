Param()

[long]$start = [DateTime]::Now.Ticks;
[string]$outFolder = Join-Path $PSScriptRoot "reports";
[string]$reportProjectFolder = Join-Path (Split-Path $PSScriptRoot -Parent) "*.Report" | Resolve-Path;
[string]$wwwrootFolder = Join-Path $reportProjectFolder "wwwroot";

#region Functions

function Get-NugetPackage([string]$name = "HtmlAgilityPack", [string]$version = "1.9.0")
{
	try
	{
		Push-Location $PSScriptRoot;
		$toolsFolder = "../../tools/$name/$version";
		[string]$dll = Join-Path $toolsFolder "lib/netstandard*/$name.dll";
		if (-not (Test-Path $dll))
		{
			$zip = Join-Path ([System.IO.Path]::GetTempPath()) "$name-$version.zip";
			if (-not (Test-Path $zip)) { Invoke-WebRequest "https://www.nuget.org/api/v2/package/$name/$version" -OutFile $zip; }

			if (-not (Test-Path $toolsFolder)) { New-Item $toolsFolder -ItemType Directory | Out-Null; }
			Expand-Archive $zip -DestinationPath $toolsFolder -Force;
		}
		return  $dll | Resolve-Path | Select-Object -Last 1;
	}
	finally { Pop-Location; }
}

function Select-LinksThatPointsToFile
{
	Param(
		[HtmlAgilityPack.HtmlNode]$Node,
		[string]$XPath,
		[string]$AttributeName
	)
	$filePaths = [System.Collections.ArrayList]::new();
	foreach ($element in $Node.SelectNodes($XPath))
	{
		$relativePath = $element.GetAttributeValue($AttributeName, "");
		if (-not [string]::IsNullOrEmpty($relativePath))
		{
			[string]$fullPath = Join-Path $wwwrootFolder $relativePath;
			if (Test-Path $fullPath) { $filePaths.Add(([PSCustomObject]@{"HtmlNode"=$element;"Path"=$fullPath})); }

			$fullPath = Join-Path $reportProjectFolder $relativePath;
			if (Test-Path $fullPath) { $filePaths.Add(([PSCustomObject]@{"HtmlNode"=$element;"Path"=$fullPath})); }
		}
	}

	return $filePaths | Where-Object { $_.Path -ne $null };
}

#endregion

Clear-Host;
Get-NugetPackage | Import-Module -Force;
foreach ($file in (Get-ChildItem $wwwrootFolder -Filter "*.html"))
{
	Write-Host " * found '$($file.Name)'";

	$outFile = Join-Path $outFolder ("$($file.BaseName).min.html");
	Copy-Item $file.FullName -Destination $outFile -Force;

	$html = [HtmlAgilityPack.HtmlDocument]::new();
	$html.Load($file.FullName);
	foreach ($link in ((Select-LinksThatPointsToFile $html.DocumentNode "//link[@data-inline='true']" "href") + (Select-LinksThatPointsToFile $html.DocumentNode "//script[@data-inline='true']" "src")))
	{
		if (-not [string]::IsNullOrEmpty($link.Path))
		{
			$link.HtmlNode.Attributes.Remove("data-inline");
			$content = $html.CreateTextNode((Get-Content $link.Path | Out-String));
			switch($link.HtmlNode.Name)
			{
				"link" {
					$link.HtmlNode.Attributes.Remove("href");
					$link.HtmlNode.Attributes.Remove("ref");
					$link.HtmlNode.Name = "style";
					$link.HtmlNode.AppendChild($content) | Out-Null;
				}

				"script" {
					$link.HtmlNode.Attributes.Remove("src");
					$link.HtmlNode.RemoveAllChildren();
					$link.HtmlNode.AppendChild($content) | Out-Null;
				}
			}
			Write-Host "   * inlined '$(Resolve-Path $link.Path -Relative)'";
		}
	}

	$html.Save($outFile);
	Write-Host "   * finished compiling '$(Split-Path $outFile -Leaf)'";
}

Write-Host "";
Write-Host " ===== finished in $(([TimeSpan]::FromTicks(([DateTime]::Now.Ticks) - $start)).ToString('mm\:ss\.fff')) =====";