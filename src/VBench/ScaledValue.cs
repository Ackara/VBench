namespace Acklann.VBench
{
    internal struct ScaledValue
    {
        public ScaledValue(double value, string friendlyValue)
        {
            Value = value;
            FriendlyValue = friendlyValue;
        }

        public double Value { get; }

        public string FriendlyValue { get; }
    }
}