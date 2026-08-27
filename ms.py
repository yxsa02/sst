#!/usr/bin/env python3
"""
生成一个指定频率、时长1秒的纯音正弦波MP3文件。

依赖安装：
    pip install pydub numpy
    需要系统安装 ffmpeg 或 libav (用于 MP3 编解码)
    - Windows: 下载 ffmpeg.exe 并添加到 PATH
    - macOS:   brew install ffmpeg
    - Linux:   sudo apt install ffmpeg
"""

import argparse
import math
import sys

try:
    from pydub import AudioSegment
    from pydub.generators import Sine
except ImportError as e:
    print("错误：缺少必要的库。请执行以下命令安装：")
    print("pip install pydub numpy")
    print("另外请确保系统已安装 ffmpeg（用于 MP3 编码）。")
    sys.exit(1)


def generate_tone(frequency_hz: float,
                  duration_sec: float = 1.0,
                  sample_rate_hz: int = 44100,
                  amplitude: float = 0.5,
                  output_filename: str = None) -> None:
    """
    生成指定频率的正弦波音频，保存为 MP3 文件。

    :param frequency_hz:     频率（Hz）
    :param duration_sec:     时长（秒）
    :param sample_rate_hz:   采样率（Hz）
    :param amplitude:        幅度（0.0 ~ 1.0），直接控制信号的线性幅度
    :param output_filename:  输出 MP3 文件名，若为 None 则自动生成
    """
    if output_filename is None:
        output_filename = f"tone_{frequency_hz:.1f}Hz_{duration_sec}s.mp3"

    # 修正：sample_rate 必须使用关键字参数传递
    sine_generator = Sine(frequency_hz, sample_rate=sample_rate_hz)

    # 生成指定时长的音频段（duration 单位为毫秒）
    audio = sine_generator.to_audio_segment(duration=duration_sec * 1000)

    # 精确幅度控制：将 dBFS 设置为 20 * log10(amplitude)
    # 避免 amplitude == 0 导致 log10(0) 错误
    if amplitude <= 0:
        print("错误：幅度必须大于 0")
        sys.exit(1)
    if amplitude < 1.0:
        gain_db = 20 * math.log10(amplitude)
        audio = audio.apply_gain(gain_db)

    # 输出 MP3
    try:
        audio.export(output_filename, format="mp3")
        print(f"已生成文件：{output_filename} (频率={frequency_hz} Hz, 时长={duration_sec}s, 幅度={amplitude})")
    except Exception as e:
        print(f"导出 MP3 失败：{e}")
        print("请检查 ffmpeg 是否正确安装并已加入 PATH。")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="生成指定频率的纯音正弦波MP3文件（默认1秒）"
    )
    parser.add_argument("frequency", type=float,
                        help="正弦波频率，单位 Hz，例如 440 表示 A4 音")
    parser.add_argument("-d", "--duration", type=float, default=1.0,
                        help="时长（秒），默认为 1.0")
    parser.add_argument("-o", "--output", type=str, default=None,
                        help="输出 MP3 文件名，默认自动生成")
    parser.add_argument("-r", "--sample-rate", type=int, default=44100,
                        help="采样率 (Hz)，默认为 44100")
    parser.add_argument("-a", "--amplitude", type=float, default=0.5,
                        help="幅度（0.0 ~ 1.0），默认为 0.5")

    args = parser.parse_args()

    if not (0 < args.amplitude <= 1.0):
        print("错误：幅度必须介于 0 和 1 之间")
        sys.exit(1)

    generate_tone(
        frequency_hz=args.frequency,
        duration_sec=args.duration,
        sample_rate_hz=args.sample_rate,
        amplitude=args.amplitude,
        output_filename=args.output
    )


if __name__ == "__main__":
    main()
'''
# 生成 440 Hz，1秒，幅度 0.5，文件名为 tone_440.0Hz_1.0s.mp3
python ms.py 440

# 生成 1000 Hz，2秒，幅度 0.3，输出到 my_sound.mp3
python ms.py 1000 -d 2 -a 0.3 -o my_sound.mp3

# 生成 261.63 Hz (中央C)，44.1kHz 采样率，满幅度
python ms.py 261.63 -r 44100 -a 1.0
'''
