using BenchmarkDotNet.Attributes;
using System;
using System.Threading;

namespace VBench.Sample
{
    [RankColumn]
    public class RandomTest
    {
        private readonly Random _random = new Random();

        [Benchmark(Description = "Deep Sleep")]
        public void DeepSleep() => Thread.Sleep(10);

        [Benchmark]
        public void RestlessSleep() => Thread.Sleep(_random.Next(100));
    }
}