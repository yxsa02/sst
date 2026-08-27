#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import subprocess
import sys
import glob
from pathlib import Path

# ========== 配置参数 ==========
t = 600.0                    # 每段切割时长（秒）
TODO_DIR = "./todo"
DID_DIR = "./did"
RES_DIR = "./res"
S_MP3 = "s.mp3"
O_MP3 = "o.mp3"
# =============================

def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def run_cmd(cmd, check=True):
    """快速执行命令"""
    result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if check and result.returncode != 0:
        raise RuntimeError(f"命令失败: {' '.join(cmd)}\n{result.stderr}")
    return result

def get_audio_duration(file_path):
    """获取时长"""
    result = run_cmd([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", file_path
    ])
    return float(result.stdout.strip())

def fix_channel_count(input_file, output_file, target_channels):
    """快速修正声道数（只改声道，不重新编码整个文件）"""
    if target_channels == '2':
        # 单声道转立体声：使用 pan filter 快速处理
        cmd = [
            "ffmpeg", "-y", "-i", input_file,
            "-af", "pan=stereo|FL=FC|FR=FC",
            "-c:v", "copy",
            "-loglevel", "error",
            output_file
        ]
    else:
        # 立体声转单声道
        cmd = [
            "ffmpeg", "-y", "-i", input_file,
            "-ac", "1",
            "-c:v", "copy",
            "-loglevel", "error",
            output_file
        ]
    run_cmd(cmd)

def process_one_file_fast(input_path, head_file, tail_file):
    """快速处理单个文件"""
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    duration = get_audio_duration(input_path)
    
    # 计算片段数
    num_segments = int((duration + t - 1e-9) // t)
    
    # 获取原始声道数
    info_cmd = ["ffprobe", "-v", "error", "-select_streams", "a:0",
                "-show_entries", "stream=channels", "-of", "default=noprint_wrappers=1:nokey=1", input_path]
    channels = run_cmd(info_cmd).stdout.strip()
    
    # 准备头尾文件（如果需要修正声道）
    head_fixed = None
    tail_fixed = None
    
    if head_file and os.path.exists(head_file):
        # 检查头文件声道数
        ch_cmd = ["ffprobe", "-v", "error", "-select_streams", "a:0",
                  "-show_entries", "stream=channels", "-of", "default=noprint_wrappers=1:nokey=1", head_file]
        head_ch = run_cmd(ch_cmd, check=False).stdout.strip()
        if head_ch != channels:
            head_fixed = os.path.join(DID_DIR, f"_temp_head_{base_name}.mp3")
            fix_channel_count(head_file, head_fixed, channels)
            head_file = head_fixed
    
    if tail_file and os.path.exists(tail_file):
        ch_cmd = ["ffprobe", "-v", "error", "-select_streams", "a:0",
                  "-show_entries", "stream=channels", "-of", "default=noprint_wrappers=1:nokey=1", tail_file]
        tail_ch = run_cmd(ch_cmd, check=False).stdout.strip()
        if tail_ch != channels:
            tail_fixed = os.path.join(DID_DIR, f"_temp_tail_{base_name}.mp3")
            fix_channel_count(tail_file, tail_fixed, channels)
            tail_file = tail_fixed
    
    # 批量切割（一次性生成所有片段）
    for idx in range(num_segments):
        start = idx * t
        seg_duration = min(t, duration - start)
        out_name = f"{base_name}_part{idx+1:03d}.mp3"
        out_path = os.path.join(DID_DIR, out_name)
        
        # 切割当前片段
        cut_cmd = ["ffmpeg", "-y", "-ss", str(start), "-i", input_path,
                   "-t", str(seg_duration), "-c", "copy", out_path]
        run_cmd(cut_cmd)
        
        # 如果有头文件，需要拼接
        if head_file or tail_file:
            temp_file = out_path + ".temp.mp3"
            
            # 构建拼接列表
            parts = []
            if head_file:
                parts.append(head_file)
            parts.append(out_path)
            if tail_file:
                parts.append(tail_file)
            
            # 快速拼接（使用 concat demuxer）
            list_file = os.path.join(DID_DIR, f"_list_{base_name}_{idx}.txt")
            with open(list_file, 'w', encoding='utf-8') as f:
                for p in parts:
                    abs_path = os.path.abspath(p).replace('\\', '/')
                    f.write(f"file '{abs_path}'\n")
            
            concat_cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0",
                         "-i", list_file, "-c", "copy", temp_file]
            run_cmd(concat_cmd)
            
            os.replace(temp_file, out_path)
            os.unlink(list_file)
        
        print(f"  ✓ {out_name}")
    
    # 清理临时文件
    for tmp in [head_fixed, tail_fixed]:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)

def main():
    print(f"快速切割工具 - 每段 {t} 秒")
    
    ensure_dir(DID_DIR)
    
    # 检查头尾
    head_path = os.path.join(RES_DIR, S_MP3) if os.path.exists(os.path.join(RES_DIR, S_MP3)) else None
    tail_path = os.path.join(RES_DIR, O_MP3) if os.path.exists(os.path.join(RES_DIR, O_MP3)) else None
    
    if tail_path:
        print(f"使用尾文件: {tail_path}")
    if head_path:
        print(f"使用头文件: {head_path}")
    
    # 获取文件
    files = glob.glob(os.path.join(TODO_DIR, "*.mp3"))
    if not files:
        print("未找到 MP3 文件")
        return
    
    print(f"找到 {len(files)} 个文件\n")
    
    for f in files:
        print(f"处理: {os.path.basename(f)}")
        process_one_file_fast(f, head_path, tail_path)
        print()
    
    print("完成！")

if __name__ == "__main__":
    main()