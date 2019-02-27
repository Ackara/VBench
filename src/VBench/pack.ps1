Param()

[long]$start = [DateTime]::Now.Ticks;
[string]$outFolder = Join-Path $PSScriptRoot "templates";
[string]$reportProjectFolder = Join-Path (Split-Path $PSScriptRoot -Parent) "*.Report" | Resolve-Path;
[string]$wwwrootFolder = Join-Path $reportProjectFolder "wwwroot";
Get-ChildItem $outFolder -File | Remove-Item;

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
	[string]$outFile = $null;

	$html = [HtmlAgilityPack.HtmlDocument]::new();
	$html.Load($file.FullName);
	$titleNode = $html.DocumentNode.SelectSingleNode("//meta[@name='application-name']");
	if ($titleNode -eq $null) { continue; }
	else
	{
		$name = $titleNode.GetAttributeValue("content", "");
		$outFile = Join-Path $outFolder "$name.html";
	}

	if ($outFile -eq $null) { continue; }
	Write-Host " * found '$($file.Name)'";
	Copy-Item $file.FullName -Destination $outFile -Force;

	foreach ($link in ((Select-LinksThatPointsToFile $html.DocumentNode "//link[@data-inline='true']" "href") + (Select-LinksThatPointsToFile $html.DocumentNode "//script[@data-inline='true']" "src")))
	{
		if (-not [string]::IsNullOrEmpty($link.Path))
		{
			$link.HtmlNode.Attributes.Remove("data-inline");
			switch ($link.HtmlNode.Name)
			{
				"link"
				{
					switch (([IO.Path]::GetExtension($link.Path)))
					{
						".css"
						{
							$link.HtmlNode.Attributes.Remove("href");
							$link.HtmlNode.Name = "style";
							$content = $html.CreateTextNode((Get-Content $link.Path | Out-String).Trim());
							$link.HtmlNode.AppendChild($content) | Out-Null;
						}
						".ico"
						{
							$imageData = [Convert]::ToBase64String((Get-Content $link.Path -Encoding Byte));
							$link.HtmlNode.SetAttributeValue("href", "data:image/x-icon;base64, $imageData") | Out-Null;
						}
					}
				}
				"script"
				{
					$link.HtmlNode.Attributes.Remove("src");
					$link.HtmlNode.RemoveAllChildren();
					$content = $html.CreateTextNode((Get-Content $link.Path | Out-String));
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