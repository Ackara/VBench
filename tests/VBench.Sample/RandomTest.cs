using BenchmarkDotNet.Attributes;
using System;
using System.Threading;

namespace VBench.Sample
{
    public class RandomTest
    {
        [Benchmark(Baseline = true)]
        public void AlgoA() => Thread.Sleep(1000);

        [Benchmark]
        public void AlgoB() => Thread.Sleep(new Random().Next(1000));

        [Benchmark]
        public void AlgoC() => Thread.Sleep(new Random().Next(1000));
    }
}