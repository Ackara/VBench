using BenchmarkDotNet.Attributes;
using System.Threading;

namespace VBench.Sample
{
    [RankColumn]
    public class RandomTest
    {
        [Benchmark(Baseline = true)]
        public void AlgoA() => Thread.Sleep(1000); // s

        [Benchmark]
        public void AlgoB() => Thread.Sleep(1050); // ms

        [Benchmark]
        public void AlgoC() => Thread.Sleep(2050); // ns

        private void DoNothing()
        {
        }
    }
}