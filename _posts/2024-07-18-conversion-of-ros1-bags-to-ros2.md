---
title:  "Conversion of ROS 1 Bags to MCAP Files (ROS 2 Default Bag Format)"
date: 2024-07-18
categories: [Robotics]
tags: [ros2]
comments: true
published: true
media_subpath: /assets/img/posts/robotics/
---
![](mcap_ros2.jpeg){: w="800" h="500" }

I would like to share the workflow that I am currently using to convert existing ROS 1 bag files to ROS 2 bag-compatible [MCAP](https://foxglove.dev/blog/introducing-the-mcap-file-format) files. Since the community is actively working on standardizing these processes, there is no definitive right or wrong way to achieve this conversion at the moment. You should also be able to use the [MCAP CLI tool](https://mcap.dev/guides/cli) to convert your .bag (ROS 1) or .db3 files (ROS 2) to self-contained MCAP files. This is one method that works seamlessly for me at the time of writing.

# Converting ROS1 Bag to ROS2 Compatible Format

The first step is to convert the ROS1 bag file to a ROS2-compatible format. For this, we will be using [rosbags](https://gitlab.com/ternaris/rosbags), a pure Python library that allows for reading, modifying, converting, and writing rosbag files. It supports both ROS1 and ROS2 bags, as well as the conversion between them.

`rosbags` can be easily installed using pip. If you prefer to build from source, refer to the instructions provided in their repository.

```bash
pip3 install rosbags
```

rosbags provides the convenient `rosbags-convert` command, which we will use to convert our ROS1 bag file to a ROS2-compatible format. The following command converts the ROS1 bag file (`ros1_bag.bag`) to a folder named `ros2_bag_dir`:

```shell
rosbags-convert --src ros1_bag.bag --dst ros2_bag_dir
```

The generated folder contains an SQLite file (.db3) and a metadata YAML configuration file. This folder can already be used in ROS 2 for playback.

We can run the following command to inspect the bag file:

```shell
ros2 bag info ros2_bag_dir
```

For example, running this command on our converted bag file will give the following output:
```
Files:             ros2_bag_dir.db3
Bag size:          722.3 MiB
Storage id:        sqlite3
Duration:          87.548s
Start:             Jan 24 2015 21:03:08.509 (1422133388.509)
End:               Jan 24 2015 21:04:36.58 (1422133476.58)
Messages:          869
Topic information: Topic: /velodyne_points | Type: sensor_msgs/msg/PointCloud2 | Count: 869 | Serialization Format: cdr
```

# Converting from sqlite3 to mcap

We will take an additional step to convert this data into the MCAP format. To convert the ROS2 bag with sqlite3 format to MCAP, we will use the `ros2 bag convert` command.

Running `ros2 bag convert -h` in the terminal gives the following output:

```
usage: ros2 bag convert [-h] -i uri [storage_id ...] -o OUTPUT_OPTIONS

Given an input bag, write out a new bag with different settings

options:
  -h, --help            show this help message and exit
  -i uri [storage_id ...], --input uri [storage_id ...]
                        URI (and optional storage ID) of an input bag. May be provided more than once
  -o OUTPUT_OPTIONS, --output-options OUTPUT_OPTIONS
                        YAML file with options for output bags. Must have one top-level key
                        "output_bags", which contains a sequence of StorageOptions/RecordOptions objects.
                        See README.md for some examples.
```

It expects the user to provide a YAML configuration file describing options for generating output data. You can refer to its [README.md](https://github.com/ros2/rosbag2/tree/humble?tab=readme-ov-file#converting-bags) for more details. Here, we will keep it simple to satisfy our needs.

Let's create a YAML file named `output_file.yaml` with the following contents:

```yaml
---
output_bags:
  - uri: ros2_bag_compressed
    storage_id: mcap
    compression_mode: file
    compression_format: zstd
```

This configuration specifies that the output should be compressed using the [Zstandard (zstd)](https://github.com/facebook/zstd) format and stored in the MCAP format.

Next, run the following command to perform the conversion:

```shell
ros2 bag convert -i ros2_bag -o output_file.yaml
```

This command will create a new folder named `ros2_bag_compressed` containing the compressed data.

```
[INFO] [1721310525.214194471] [rosbag2_storage]: Opened database 'ros2_bag/ros2_bag.db3' for READ_ONLY.
[INFO] [1721310527.823071264] [rosbag2_compression]: Compressing file: ros2_bag_compressed/ros2_bag_compressed_0.mcap
```

We can run the previous `ros2 bag info` command again to inspect the data:

```shell
ros2 bag info ros2_bag_compressed
```

which outputs the following:

```
Files:             ros2_bag_compressed_0.mcap.zstd
Bag size:          143.8 MiB
Storage id:        mcap
Duration:          87.548s
Start:             Jan 24 2015 21:03:08.509 (1422133388.509)
End:               Jan 24 2015 21:04:36.58 (1422133476.58)
Messages:          869
Topic information: Topic: /velodyne_points | Type: sensor_msgs/msg/PointCloud2 | Count: 869 | Serialization Format: cdr
```

This time we can see a significant reduction in storage size from 722.3 MiB to 143.8 MiB, which is about an 80% decrease without any data loss. You can play back this data using the standard `ros2 bag play` command as usual, which will decompress and generate an `.mcap` file:

```shell
ros2 bag play ros2_bag_compressed
```