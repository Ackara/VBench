using BenchmarkDotNet.Running;
using System;

namespace VBench.Sample
{
    class Program
    {
        static void Main(string[] args)
        {
            var summary = BenchmarkRunner.Run<RandomTest>();
        }
    }
}
