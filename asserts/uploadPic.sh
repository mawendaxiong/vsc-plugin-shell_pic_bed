#!/bin/bash

private_key_path=$1
username=$2
#  服务域名，包含http
server_domain=$3
#  剔除http和https
host_domain=$4
server_image_path=$5
access_photo_port=$6
access_photo_url=$7

param_index=1
last_param_index=7

for i in "$@"; do
    # 过滤掉前6个参数 
    if [ $param_index -gt $last_param_index ]; then
        echo "file: $i"
        if [ -z "$private_key_path" ]; then
            scp $i  "$username"@"$host_domain":"$server_image_path"
        else
            scp -i "$private_key_path" $i  "$username"@"$host_domain":"$server_image_path"
        fi
    fi
    let param_index+=1
done

# 重置
param_index=1

echo "Upload Success:"

for file in "$@"; do
    if [ $param_index -gt $last_param_index ]; then
        IFS='/' read -r -a array <<< "$file"
        id="${#array[@]}"
        echo "$server_domain":"$access_photo_port""$access_photo_url""${array[$id-1]}"
    fi
    let param_index+=1
done
