declare const _default: "<?php\n\nfunction zipDir($dir, $output, $additionalFiles = array())\n{\n    $zip = new ZipArchive;\n    $res = $zip->open($output, ZipArchive::CREATE);\n    if ($res === TRUE) {\n        foreach ($additionalFiles as $file) {\n            $zip->addFile($file);\n        }\n        $directories = array(\n            rtrim($dir, '/') . '/'\n        );\n        while (sizeof($directories)) {\n            $dir = array_pop($directories);\n\n            if ($handle = opendir($dir)) {\n                while (false !== ($entry = readdir($handle))) {\n                    if ($entry == '.' || $entry == '..') {\n                        continue;\n                    }\n\n                    $entry = $dir . $entry;\n\n                    if (is_dir($entry)) {\n                        $directory_path = $entry . '/';\n                        array_push($directories, $directory_path);\n                    } else if (is_file($entry)) {\n                        $zip->addFile($entry);\n                    }\n                }\n                closedir($handle);\n            }\n        }\n        $zip->close();\n        chmod($output, 0777);\n    }\n}\n\nfunction unzip($zipPath, $extractTo, $overwrite = true)\n{\n    if(!is_dir($extractTo)) {\n        mkdir($extractTo, 0777, true);\n    }\n    $zip = new ZipArchive;\n    $res = $zip->open($zipPath);\n    if ($res === TRUE) {\n        $zip->extractTo($extractTo);\n        $zip->close();\n        chmod($extractTo, 0777);\n    }\n}\n\n\nfunction delTree($dir)\n{\n    $files = array_diff(scandir($dir), array('.', '..'));\n    foreach ($files as $file) {\n        (is_dir(\"$dir/$file\")) ? delTree(\"$dir/$file\") : unlink(\"$dir/$file\");\n    }\n    return rmdir($dir);\n}\n";
export default _default;
