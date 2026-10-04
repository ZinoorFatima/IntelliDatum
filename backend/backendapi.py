from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
import os
import base64
from werkzeug.utils import secure_filename
import re
import random
import itertools
import csv
from langchain_community.llms import HuggingFacePipeline
from langchain_core.prompts import PromptTemplate  # New
from langchain_core.output_parsers import StrOutputParser
import json
from transformers import AutoModelForCausalLM, AutoTokenizer
import transformers
from sklearn.feature_extraction.text import TfidfVectorizer
from qdrant_client import QdrantClient
from sklearn.metrics.pairwise import cosine_similarity
from qdrant_client.models import Distance, VectorParams
import nomic
from nomic import embed
from qdrant_client.http import models
from qdrant_client.models import PointStruct
import numpy as np
import csv
from qdrant_client.http import models
from io import StringIO
from pathlib import Path


counter = 0


app = Flask(__name__)
# 1. Configure CORS properly
CORS(app, resources={
    r"/process": {
        "origins": ["http://localhost:3000"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Set the base directory and upload folder relative to app.py
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # Get the directory where app.py is located
load_dotenv(os.path.join(BASE_DIR, '.env'))  # API keys live in backend/.env (see .env.example)
UploadFolder = os.path.join(BASE_DIR, 'uploads')  # Set upload folder relative to app.py

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv'}  # Add more file types if needed

# Ensure the upload folder exists
if not os.path.exists(UploadFolder):
    os.makedirs(UploadFolder)

# Configure Flask app
app.config['UPLOAD_FOLDER'] = UploadFolder
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max file size: 16 MB

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



def qdrant_cred():
    qdrant_client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY") or None,
    )
    return qdrant_client

    
def create_collection(client):
    collection_name = "All_Records_nomic"
    size = 768
    existing_collections = client.get_collections().collections
    if not any(coll.name == collection_name for coll in existing_collections):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size= size, distance=Distance.COSINE),
        )
        print(f"Collection '{collection_name}' has been created.")
    else:
        print(f"Collection '{collection_name}' already exists.")

    return collection_name

def nomic_cred():
    NOMIC_API_KEY = os.getenv("NOMIC_API_KEY")
    nomic.cli.login(NOMIC_API_KEY)

def get_embeddings(input_texts, model_api_string = "nomic-embed-text-v1", task_type="search_document"):
    outputs = embed.text(
        texts=[text for text in input_texts],
        model=model_api_string,
        task_type=task_type,
    )

    return outputs["embeddings"]
    
def delete_records(client,collection_name):
    client.delete(
        collection_name=collection_name,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[]
            )
        ),
    )


def prepare_data(lines, embeddings):
    # Prepare the data to upload it to Qdrant collection
    points = []
    for idx, (line, embedding) in enumerate(zip(lines, embeddings)):
        #print(embedding)
        points.append(PointStruct(id=idx, vector=embedding, payload={"text": line}))
        #print(points)
    
    return points

    
def read_points(limit):
    scroll = client.scroll(
        collection_name=collection_name,  
        limit= limit,  
        with_payload=True, 
        with_vectors=True  
    )

    points = scroll[0]
    return points

def jaccard_similarity(vec1, vec2):
    intersection = np.logical_and(vec1, vec2).sum()
    union = np.logical_or(vec1, vec2).sum()
    return intersection / union if union != 0 else 0

def count_fields(record, field_separator):
    """
    Count the number of fields in a record, considering quoted fields.
    """
    if not isinstance(record, str):
        return 0

    if field_separator is None:
        return 0
    reader = csv.reader(StringIO(record), delimiter=field_separator, quotechar='"')
    fields = next(reader, [])  # Get the first (and only) row as a list
    return len(fields)

def get_first_field(record, field_separator):
    """
    Extract the first field from a record, considering quoted fields.
    """
    if not isinstance(record, str) or field_separator is None:
        return None
    reader = csv.reader(StringIO(record), delimiter=field_separator, quotechar='"')
    fields = next(reader, [])  # Get the first row as a list
    return fields[0] if fields else None  # Return the first field if available



def is_similar(line, text_db, cosine_sim, field_separator):
    similar = False
    '''line_field_count = 0
    db_field_count = -1
    
    # Ensure line and text_db are not None
    if not isinstance(line, str) or not isinstance(text_db, str):
        return False'''
    if field_separator:
    # Check if the first field matches in both records
        first_field_line = get_first_field(line, field_separator)
        first_field_db = get_first_field(text_db, field_separator)
    
    if cosine_sim > 0.6:
        similar = True
        
        # Count fields properly considering quoted values
        line_field_count = count_fields(line, field_separator)
        db_field_count = count_fields(text_db, field_separator)
        if line_field_count == db_field_count:
            similar = True
        else:
            similar = False
            
    # Check if both records have the same number of fields
    if field_separator is None:
        similar = True
    elif not similar:
        
        if first_field_line == first_field_db:
            similar = True  # Override similarity if first fields match

    return similar

def group_records(points, embeddings, lines, field_separator):
    groups = []
    remaining_points = points.copy() 

    #print(remaining_points)
    iterator = 0
    # Loop to group embeddings on basis on closer embeddings
    for embedding, line in zip(embeddings, lines):
        iterator += 1
        to_remove = []  
        grouped_points = []
       # print (f"Line: {line}")
    
        for Record in remaining_points:  
            vector_db = np.array(Record.vector)
            text_db = Record.payload.get('text', "No text available") 
            #print (f"Compared Line: {text_db}") 

            # Compute Jaccard Similarity
            #binary_embedding = (embedding > 0).astype(int)
            #binary_vector_db = (vector_db > 0).astype(int)
            #jaccard_sim = jaccard_similarity(embedding, vector_db)
                
            # Compute Cosine Similarity
            cosine_sim = cosine_similarity([embedding], [vector_db])[0][0]
            
            
            # Threshold for grouping
            if is_similar(line, text_db, cosine_sim, field_separator):
               # print(f"IS SIMILAR: {cosine_sim}")
                grouped_points.append({
                    'line': text_db,
                    'embedding_vector': vector_db,  
                    #'jaccard_similarity': jaccard_sim,
                    'cosine_similarity' : cosine_sim
                })

                to_remove.append(Record)
                #print(f"groupped: {grouped_points}, remove: {to_remove}")

            

        
        remaining_points = [point for point in remaining_points if point not in to_remove]
       # print(f"Remaining points: {remaining_points}")
        #print(f"Groupped points: {grouped_points}")
        if(grouped_points):
            groups.append(grouped_points)

        
    # Displaying Groups
    #print("\nGrouped Points with Cosine Similarity > 0.6 :")
    iterator = 0
    count = 0
    
    #print(remaining_points)

    for group in groups:
        iterator += 1
        print(f"Group: {iterator}")
        for grouped_point in group:
            print(f"{grouped_point['line']} -> Cosine Sim: {grouped_point['cosine_similarity']}")
            count += 1

    return groups, iterator

# Function to upload points to Qdrant collection in batches
def upload_in_batches(client, collection_name, points, batch_size=100):
    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        try:
            client.upsert(collection_name=collection_name, points=batch)
        except Exception as e:
            print(f"Error uploading batch {i//batch_size + 1}: {e}")


# Function to fetch data from Qdrant collection in batches
def fetch_data_in_batches(client, collection_name, batch_size=100):
    offset = 0
    all_points = []
    
    while True:
        result = client.scroll(
            collection_name=collection_name,
            limit=batch_size,
            with_payload=True,  
            with_vectors=True,
            offset=offset,  
        )

        points = result[0]  

        if not points:  
            break

        all_points.extend(points)
        offset += len(points)
    
    return all_points

def group_record_for_file(collection_name,client,filename, doc_separator = "***", field_separator= ","):
    if not filename:
        print(f"Error! No file {filename} found.")

    print(f"Processing File: {filename}")

    with open(filename, "r", encoding="latin-1") as file:
        lines = [line.strip() for line in file.readlines()]

    if not lines:
        print(f"No lines found in {filename}")
    
    if len(lines) > 500:
        print(f"Number of lines greater than 500: {len(lines)}")
        
    if doc_separator:
        stripped_doc_separator = doc_separator.replace('\\r\\n', '').replace('\r', '').replace('\n', '').strip()
    
    filtered_lines = []
    for line in lines:
        trimmed_line = line.strip()
        if not trimmed_line:
            continue
        if trimmed_line == stripped_doc_separator:
            continue
        else:
          filtered_lines.append(line)

    print("\n******************************")
    # Generate embeddings
    embeddings = get_embeddings(filtered_lines)
    #print("EMBEDDINGS CREATED")
    
    delete_records(client,collection_name)
    #print("RECORDS DELETED")
    points = prepare_data(filtered_lines, embeddings)
   # print("DATA PREPARED:")
    #print(points)
    upload_in_batches(client, collection_name, points, 50)
   # print("DATA UPLOADED")
    fetched_points = fetch_data_in_batches(client, collection_name, 50)
   # print("DATA FETCHED:")
    
   # print("points: ",fetched_points)
    groups, iterator = group_records(fetched_points, embeddings, filtered_lines, field_separator)
    
    print(f"Groups Formed: {iterator}")
    print("***************************************\n\n")
    
    return groups
    
def clean_text(text):
    """Remove non-printable characters from the text."""
    return ''.join(c for c in text if c.isprintable())

def split_columns(text, delimiter):
    """Split text into columns using CSV parser with detected delimiter."""
    text = clean_text(text)
    reader = csv.reader(
        [text], 
        delimiter=delimiter, 
        quotechar='"', 
        skipinitialspace=True
    )
    try:
        return next(reader)
    except StopIteration:
        return []

def make_headers_unique(headers):
    """Add suffix to duplicate headers to make them unique."""
    unique_headers = []
    header_counts = {}
    for header in headers:
        if header in header_counts:
            header_counts[header] += 1
            unique_header = f"{header}_{header_counts[header]}"
        else:
            header_counts[header] = 0
            unique_header = header
        unique_headers.append(unique_header)
    return unique_headers

def detect_delimiter(line):
    """Detect delimiter from a given line."""
    common_delimiters = [',', '|', ';', '\t']
    delimiter_counts = {delim: line.count(delim) for delim in common_delimiters}
    if not any(delimiter_counts.values()):
        return None
    return max(delimiter_counts, key=delimiter_counts.get)

def column_seperation(group):
    n = 5
    k = 3
    # Treat the group as non-header data
    data_lines = []
    for line in group:
        stripped_line = line.strip()
        if not stripped_line or re.fullmatch(r'^\*+$', stripped_line):
            continue
        data_lines.append(stripped_line)

    if not data_lines:
        print("No data lines after filtering.")
        return 

    try:
        # Detect delimiter from first data line
        first_data_line = data_lines[0]
        delimiter = detect_delimiter(first_data_line)
        if delimiter is None:
            print("No delimiter detected in group data")
            return 

        # Split data lines into columns
        split_data = []
        for line in data_lines:
            cols = split_columns(line, delimiter)
            split_data.append(cols)

        max_cols = max(len(cols) for cols in split_data) if split_data else 0
        if max_cols == 0:
            print("No columns detected.")
            return found, not_found

        headers = [f"Column_{i+1}" for i in range(max_cols)]
        aligned_data = []
        for cols in split_data:
            aligned = cols[:max_cols] + [''] * (max_cols - len(cols))
            aligned_data.append(aligned)

        print(f"Inferred delimiter: {delimiter}")
        print(f"Generated headers: {headers}")

        print(f"First {n} rows:")
        for row in aligned_data[:n]:
            print(row)

        # Calculate non-missing values for each row
        non_missing_counts = [sum(1 for x in val if x.strip()) for val in aligned_data[:n]]
        print("Non-missing values per row:", non_missing_counts)

        # Select top k rows based on non-missing values
        
        rows_with_non_missing = list(zip(non_missing_counts, aligned_data[:n]))
        sorted_rows = sorted(rows_with_non_missing, key=lambda x: -x[0])
        topk_rows = sorted_rows[:k]

        print(f"Top {k} rows with the most non-missing values:")
        if topk_rows:
            result = {header: [] for header in headers}
            for _, row in topk_rows:
                for i, header in enumerate(headers):
                    result[header].append(row[i] if i < len(row) else '')
            return result
            # for header in headers:
            #     print(f"{header} = {result[header]}")

        # else:
        #     print("No rows to display.")

        # print("")

    except Exception as e:
        print(f"Error processing group data: {e}")

    # structured_text = f"""
    # Structured Data Preview:
    # Delimiter: {delimiter}
    # Headers: {headers}
    
    # Mapped Columns: 
    # """

    

    # return structured_text


def check_doc_separator(lines):
    """Check for a doc separator based on a sequence of stars like '*', '**', '***', etc.
    and return the sequence of stars found in the line."""
    for line in lines:
        stripped_line = line.strip()  # Remove any surrounding whitespace
        #print("LINE:", repr(stripped_line)) 
        if stripped_line and all(char == '*' for char in stripped_line):
            #print("88888888888888 ",stripped_line)
            # The line contains only stars, e.g., "*", "**", "***", etc.
            return stripped_line  # Return the sequence of stars
    return '\r\n' 

def model_load():
    access_token = os.getenv("HF_TOKEN")
    model = "meta-llama/Llama-2-7b-chat-hf"
    
    tokenizer = AutoTokenizer.from_pretrained(
        model, 
        use_auth_token=access_token )
    
    model = AutoModelForCausalLM.from_pretrained(
        model,
        device_map="cpu",
        load_in_8bit=False,
        use_auth_token=access_token
    )
    
    model.config.use_cache = False
    model.config.pretraining_tp = 1
    
    pipeline = transformers.pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
    )

    assistant_llm = HuggingFacePipeline(pipeline=pipeline)

    return assistant_llm

def project_level_desc(assistant_llm):
    assistant_template_description =  """[INST] <<SYS>>  
    ## Role: Act as a data analyst.
    ## Purpose: Analyze the structured data below and generate a concise overview (under 100 words) describing the dataset’s nature, scope, and primary function. Focus on what the data is about (e.g., Transactions, health care , bank ), and general purpose (e.g., tracking interactions, managing records).  Infer the dataset’s domain and summarize its intent, composition, and typical use cases. 
    ## Output Format: A short paragraph of 100 words
    
    Dataset:
    {row}
    
    Output paragraph:
    [/INST]"""
    
    
    #Create the prompt template to use in the Chain for the first Model.
    assistant_prompt_template_description = PromptTemplate(
        input_variables=["row"],
        template=assistant_template_description
    )
    
    
    #NEW CODE USING LCEL
    output_parser = StrOutputParser()
    assistant_chain_description = assistant_prompt_template_description | assistant_llm | output_parser

    return assistant_chain_description

def create_dialog_description(row,assistant_chain_description):
    #calling the .invoke method from the chain created Above.
    assistant_response = assistant_chain_description.invoke(
        {"row": row
             },
        )
    return assistant_response

def clean_Columns(data_dict):
    cleaned_dict = {}
    cleanCols = ""
    for col, values in data_dict.items():
        if any(val.strip() != '' for val in values):  # Keep only if there is any non-empty value
            cleaned_values = [val if len(val) <= 30 else val[:30] for val in values]
            cleaned_dict[col] = cleaned_values
        else:
            # Keep the column but with an empty list
            cleaned_dict[col] = []  # Keeps column number but removes data

    formatted_output = ""
    count = 1
    for key, values in cleaned_dict.items():
        # Replace empty lists with "(Empty)" or skip them
        if not values or all(val == '' for val in values):
            continue  # Skip empty lists
        else:
            formatted_output += f"Value {count}: {values}\n"
            count += 1  # Increment only when non-empty values are printed

    return formatted_output



#create dict
def DictionaryGenerate(TagList, inputCols, RecName, delimiter, docSeparator, isMultiRec):
    print("Generating XML Skeleton...")

    # Build field entries from tag list and inputCols
    field_entries = ""
    for idx, (tag, col) in enumerate(zip(TagList, inputCols)):
        field_entries += f'        <field name="{tag}" type="string" format="" index="{idx}" />\n'

    # Fill in the full skeleton
    skeletonEPF = f"""<?xml version="1.0" encoding="utf-8" ?>
<doc-info separator="{docSeparator}" value="{delimiter}" append-existing-file="false">
  <record-info separator="{delimiter}" multi-record="{str(isMultiRec).lower()}" rec-id-index="0" skip-first-record="false" />
  <field-info separator="{delimiter}" />
</doc-info>
<data-layout>
  <record name="{RecName}" id="{RecName}">
{field_entries}  </record>
</data-layout>
"""

    print(skeletonEPF)
    return skeletonEPF
    

def run_time_tag_gen(collection_name,file,client):
    delimiter=''
    doc_separator=''
    
    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        first_line = lines[0].strip()
        delimiter = detect_delimiter(first_line)
        doc_separator = check_doc_separator(lines)
        
        print("delimiter: ",delimiter)
        print("doc_separator: ",doc_separator)


    #RAG seperation of file 
    groups=group_record_for_file(collection_name,client,file,doc_separator,delimiter)
    
    # Step 1: Check if file is header/non-header
    is_header = False
    try:
        with open(file, 'r', encoding='utf-8', errors='ignore') as f:
            first_line = f.readline().strip()
            if first_line.startswith('%') or (len(first_line) > 1 and first_line[1] == '%'):
                is_header = True

        ######GROUP WISE PROCESSING ############
        sepText=''
        for group_idx, group in enumerate(groups, 1):
            #print(f"\nProcessing Group {group_idx}:")
            group_texts = [record['line'] for record in group]  # Extract text from group
            
            # Process this group's text
            #print(type(group_texts))
            sepText=column_seperation(group_texts)  
            #sepText+= f"\n\nGroup {group_idx} Structure:\n{group_structured
            
            print("RETURNED MAPPING:  ",sepText)
            ###TYPE OF SEPTEXT ID DICT MAPPED DATA LIKE {column 1 : [1,1,1]} ETC
        
        ##PROJECT LEVEL DESC ACCORDING TO THE LAST GROUP ######
        assistant_llm=model_load()
        assistant_chain_description=project_level_desc(assistant_llm)
        project_desc = create_dialog_description(sepText,assistant_chain_description)
        print("Project_desc  ahbfhadsuheuawfiea: ",project_desc)
        print("thisss")
        cleanCols = clean_Columns(sepText)
        
        print(cleanCols)

        #find best match by comparing descriptions
        
                # Base directory containing pattern files
        base_dir = r"Delimited"
        
        # Dictionary to store file descriptions
        descriptions = {}
        
        # Iterate through every file in the folder and store descriptions
        for root, dirs, files in os.walk(base_dir):
            if root == base_dir:
                continue  # Skip the base directory
        
            print(f"Processing Subdirectory: {root}")
            
            for file_name in files:
                file_path = os.path.join(root, file_name)
                print(f"Reading File: {file_path}")
                fileP = Path(file_path)
                if (fileP.stem == "description"):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        descriptions[file_path] = f.read()
        
        # Convert to TF-IDF vectors
        vectorizer = TfidfVectorizer()
        file_paths = list(descriptions.keys())  # Store file paths
        file_contents = list(descriptions.values())  # Store file descriptions
        
        
        # Vectorize input description and file descriptions
        vectors = vectorizer.fit_transform([project_desc] + file_contents)
        
        # Compute cosine similarity
        cosine_similarities = cosine_similarity(vectors[0:1], vectors[1:]).flatten()
        
        # Find the most similar description
        best_match_index = cosine_similarities.argmax()
        best_match_path = file_paths[best_match_index]
        best_match_score = cosine_similarities[best_match_index]
        
        print("Most similar file:", best_match_path)
    #tag generation**********************************************
        #clean the data for tag generation
        # Load JSON Data
        patternPath = best_match_path.replace("description.txt", "pattern.json")
        with open(patternPath, 'r') as file:
            json_data = json.load(file)
        
        assistant_template = """[INST] <<SYS>>
        You are an AI assistant that predicts column names for a given set of values by analyzing their structure and meaning. 
        
        ### **Guidelines:**  
        - Learn from the given examples to infer column names logically. 
        - You are given a description of the project to help infer the column names.
        - Do **not** match values exactly; instead, determine an appropriate column name based on patterns and semantics.  
        - If a value does not fit any known pattern, create a **clear and short** column name.
        - Mention column names for each set of values **ONLY ONCE**.
        
        ###**Output format must strictly follow:**  
          **column1**:Column Name1
          **column2**:Column Name2
          ...
          
        ### **Examples for Reference:** 
        {json_data}  
        <</SYS>> [/INST]   
        
        ### **Task:**  
        Given the following values, predict the best column names while preserving the original sequence.
        
        #### **Values:**
        {row}
        
        #### **Column Names Output:** """
        
        
        #Create the prompt template to use in the Chain for the first Model.
        assistant_prompt_template = PromptTemplate(
            input_variables=["row","json_data"],
            template=assistant_template
        )
        
        
        #NEW CODE USING LCEL
        output_parser = StrOutputParser()
        assistant_chain = assistant_prompt_template | assistant_llm | output_parser
        
        #Support function to obtain a response to a user comment.
        def create_dialog( row, json_data):
            #calling the .invoke method from the chain created Above.
            assistant_response = assistant_chain.invoke(
                {"row": row,
                 "json_data":json_data}
            )
            return assistant_response
            
        assistant_response=create_dialog(cleanCols, json_data)
        print(assistant_response)
        
        matches = re.findall(r"\*\*column(\d+)\*\*:\s*(.*)", assistant_response)
        tagList = [name for _, name in matches]
        print(tagList)

        Dict = DictionaryGenerate(tagList,sepText,RecName=sepText['Column_1'][0],
    delimiter=delimiter,
    docSeparator=doc_separator,
    isMultiRec=True)
        return Dict
        
    except ValueError as e:
        print("Caught error:", e)
        return "Error in generating" + str(e)
        

def TagGeneration(input_text):
    client=qdrant_cred()
    create_collection(client)
    nomic_cred()
    collection_name='All_Records_nomic'
    result=run_time_tag_gen(collection_name,input_text,client)
    print("Generated Tags:\n", result)
    return result

def process_text(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    # Check if file exists
    if not os.path.exists(file_path):
        return None
    
    # Open the file and read the content
    with open(file_path, 'r') as file:
        file_content = file.read()
    dictionary = TagGeneration(file_path)
    os.remove(file_path)
    return dictionary


@app.route('/process', methods=['POST'])
def process():
    # If the request contains a file
    if 'file' in request.files:
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file and allowed_file(file.filename):
            # Secure the filename to prevent directory traversal attacks
            filename = secure_filename(file.filename)
            
            # Save the file to the upload folder
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            # Process the uploaded text or CSV file, streaming progress as server-sent events.
            # The web app shows each "data: ..." line as the file status and expects the
            # generated dictionary as "data: Final result: <base64>".
            def generate():
                yield "data: Processing\n\n"
                file_content = process_text(filename)

                if not file_content:
                    yield "data: Unable to process the file\n\n"
                    return

                encoded = base64.b64encode(file_content.encode('utf-8')).decode('ascii')
                yield f"data: Final result: {encoded}\n\n"

            return Response(stream_with_context(generate()), mimetype='text/event-stream')
        else:
            return jsonify({'error': 'File type not allowed'}), 400

    return jsonify({'error': 'No file part'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
