using Acklann.VBench;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Configs;
using System.Threading;

namespace VBench.Sample
{
    public class RandomTest
    {
        [Benchmark(Baseline = true)]
        public void AlgoA() => Thread.Sleep(1000); // s

        [Benchmark]
        public void AlgoB() => Thread.Sleep(10); // ms

        [Benchmark]
        public void AlgoC() => DoNothing(); // ns

        private void DoNothing()
        {
        }
    }
}