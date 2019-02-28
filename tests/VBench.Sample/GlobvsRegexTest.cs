using BenchmarkDotNet.Attributes;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace VBench.Sample
{
    [MemoryDiagnoser]
    [RankColumn(BenchmarkDotNet.Mathematics.NumeralSystem.Arabic)]
    public class GlobvsRegexTest
    {
        public GlobvsRegexTest()
        {
            var list = new Stack<string>();
            using (var reader = new StreamReader(File.OpenRead("fileList.txt")))
            {
                while (!reader.EndOfStream)
                {
                    string path = reader.ReadLine().Trim();
                    if (!string.IsNullOrEmpty(path)) list.Push(path);
                }
            }

            FileList = list.ToArray();
            Globs = Patterns().Select(x => x.Glob).ToArray();
            RegexExp = Patterns().Select(x => x.Regex).ToArray();
        }

        public readonly string[] FileList, Globs, RegexExp;

        [Benchmark(Baseline = true)]
        public int Regex()
        {
            int matches = 0;
            foreach (var pattern in RegexExp)
            {
                var sut = new Regex(pattern, RegexOptions.Compiled);
                foreach (var path in FileList)
                {
                    if (sut.IsMatch(path)) matches++;
                }
            }

            return matches;
        }

        [Benchmark]
        public int GlobN()
        {
            int matches = 0;
            foreach (var pattern in Globs)
            {
                var sut = new Acklann.GlobN.Glob(pattern);
                foreach (var path in FileList)
                {
                    if (sut.IsMatch(path)) matches++;
                }
            }

            return matches;
        }

        private static (string Glob, string Regex)[] Patterns()
        {
            return new (string, string)[]
            {
                ("**/*", ".+"),
                ("**/*.png", @".+\.png"),
                ("**/purus/**/*", "purus/.+"),
                ("/sed/**/*/felis.html", @"sed/.+/felis\.html"),
                ("nullam/sit/amet/turpis/elementum/ligula/vehicula.jsp", "nullam/sit/amet/turpis/elementum/ligula/vehicula.jsp")
            };
        }
    }
}